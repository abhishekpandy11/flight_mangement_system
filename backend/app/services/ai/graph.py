import os
import json
from typing import Annotated, TypedDict, List, Union
from typing_extensions import TypedDict

from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.runnables import RunnableConfig

from app.services.ai.tools import tools
from app.core.config import settings

# Load state
class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

# Define the agent node
async def agent(state: State, config: RunnableConfig):
    user_id = config.get("configurable", {}).get("user_id", "unknown")
    
    # Using Llama 3.1 8B for reliable tool calling performance on Groq
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.2,
        groq_api_key=settings.GROQ_API_KEY
    )
    
    # Bind tools 
    llm_with_tools = llm.bind_tools(tools)
    
    # Define system prompt
    system_prompt = (
        "You are an expert flight booking assistant for SkyRoute. "
        "You help users search for flights, book them, and manage their reservations. "
        f"The current user's ID is {user_id}. Always use this ID when a tool requires it. "
        "When showing flight lists, be clear and organized. "
        "Be helpful, concise, and professional."
    )
    
    # Process messages: Prune history to keep only last 15 messages for speed
    # Always include the system prompt first
    messages = [SystemMessage(content=system_prompt)] + state["messages"][-15:]
    
    # Get response
    response = await llm_with_tools.ainvoke(messages)
    
    return {"messages": [response]}

# Define the tool node
tool_node = ToolNode(tools)

# Define the condition for routing
def should_continue(state: State):
    messages = state["messages"]
    last_message = messages[-1]
    
    # Check for tool calls
    if last_message.tool_calls:
        # Check if any tool call is for human assistance
        for tool_call in last_message.tool_calls:
            if tool_call["name"] == "request_human_assistance":
                return "human_assistance"
        return "tools"
    return END

async def human_assistance(state: State):
    """Pause execution for human input."""
    # This node is mostly a placeholder for the interrupt
    return state

# Build the graph
workflow = StateGraph(State)

workflow.add_node("agent", agent)
workflow.add_node("tools", tool_node)
workflow.add_node("human_assistance", human_assistance)

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "human_assistance": "human_assistance",
        END: END
    }
)

workflow.add_edge("tools", "agent")
workflow.add_edge("human_assistance", "agent")

# Compile with memory and interrupt
memory = MemorySaver()
graph = workflow.compile(
    checkpointer=memory,
    interrupt_before=["human_assistance"]
)
