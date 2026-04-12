from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.api.deps import get_current_user
from app.services.ai.graph import graph
from app.models.user import User
from app.core.database import SessionLocal
from sqlalchemy.future import select
from langchain_core.messages import HumanMessage, ToolMessage

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    thread_id: str
    status: str = "success"  # success, waiting_for_human
    refresh_bookings: bool = False

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, email: str = Depends(get_current_user)):
    try:
        async with SessionLocal() as db:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        
        thread_id = request.thread_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id, "user_id": user.id}}
        
        input_data = {"messages": [HumanMessage(content=request.message)]}
        result = await graph.ainvoke(input_data, config=config)
        
        # Check if the graph is waiting for human assistance
        state = await graph.aget_state(config)
        status = "success"
        if state.next and "human_assistance" in state.next:
            status = "waiting_for_human"
            
        final_message = result["messages"][-1].content
        
        # Check if a booking was created or cancelled to signal frontend refresh
        refresh_bookings = False
        relevant_tools = ["create_new_booking", "cancel_existing_booking"]
        for msg in result["messages"]:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    if tc["name"] in relevant_tools:
                        refresh_bookings = True
                        break
            if refresh_bookings:
                break

        return ChatResponse(
            response=final_message,
            thread_id=thread_id,
            status=status,
            refresh_bookings=refresh_bookings
        )
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ResumeRequest(BaseModel):
    thread_id: str
    human_input: str

@router.post("/resume", response_model=ChatResponse)
async def resume_chat(request: ResumeRequest, email: str = Depends(get_current_user)):
    try:
        async with SessionLocal() as db:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        
        config = {"configurable": {"thread_id": request.thread_id, "user_id": user.id}}
        
        # Get current state to find the tool call id
        state = await graph.aget_state(config)
        if not state.next or "human_assistance" not in state.next:
            raise HTTPException(status_code=400, detail="Conversation is not waiting for human assistance")
            
        # We need to provide the tool match for the request_human_assistance tool
        last_message = state.values["messages"][-1]
        tool_call_id = None
        if last_message.tool_calls:
            for tc in last_message.tool_calls:
                if tc["name"] == "request_human_assistance":
                    tool_call_id = tc["id"]
                    break
        
        if not tool_call_id:
            # Fallback if somehow tool_call_id is missing
            input_data = None 
        else:
            # Provide the human response as the result of the tool
            input_data = {
                "messages": [
                    ToolMessage(
                        tool_call_id=tool_call_id,
                        content=f"Human Agent Response: {request.human_input}"
                    )
                ]
            }
        
        # Resume the graph (passing None to input_data if we just want to continue from interrupt)
        # Actually, in LangGraph, updating state and then invoking with None is one way.
        # Here we provide the tool output.
        result = await graph.ainvoke(input_data, config=config)
        
        # Check if it interrupted again (unlikely but possible)
        new_state = await graph.aget_state(config)
        status = "success"
        if new_state.next and "human_assistance" in new_state.next:
            status = "waiting_for_human"
            
        final_message = result["messages"][-1].content
        
        # Check if a booking was created or cancelled to signal frontend refresh
        refresh_bookings = False
        relevant_tools = ["create_new_booking", "cancel_existing_booking"]
        for msg in result["messages"]:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    if tc["name"] in relevant_tools:
                        refresh_bookings = True
                        break
            if refresh_bookings:
                break

        return ChatResponse(
            response=final_message,
            thread_id=request.thread_id,
            status=status,
            refresh_bookings=refresh_bookings
        )
    except Exception as e:
        print(f"Resume Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
