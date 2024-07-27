import json
import os
from langchain_openai import ChatOpenAI
from langchain import PromptTemplate
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

# Read the API key from Docker secret file
api_key_path = '/run/secrets/api_key_secret'
with open(api_key_path, 'r') as file:
    api_key = file.read().strip()

system_template = """
You are a calendar maker. You will be given an event, its length, and the total number of hours needed for preparation before the event. 

Your task is to create a calendar that includes both the preparation time and the event itself. The total preparation time for each event must add up exactly to the preparation hours provided, not the event length. You are to schedule the preparation and the event between 12 PM and midnight, ensuring that there are no overlaps with existing timeslots in the current calendar. 

If possible, spread out the preparation time across multiple periods to avoid scheduling conflicts and manage the workload effectively. You may override existing timeslots only if they are holidays or similar exceptions. 

**Important:** Ensure that the total preparation time sums exactly to the preparation hours given. 

If prep is 0, do not create Preparation for Event items

Return your calendar as a $JSON_BLOB in the following format:\n\n
{{\n\
    "action":"Make Calendar",\n\
    "calendar":"[Preparation 1 for Event 1 Title, Preparation 1 for Event 1 Start Date, Preparation 1 for Event 1 Start Time, Preparation 1 for Event 1 Length (in hours), Preparation 2 for Event 1 Title, Preparation 2 for Event 1 Start Date, Preparation 2 for Event 1 Start Time, Preparation 2 for Event 1 Length (in hours), ... , Preparation x for Event 1 Title, Preparation x for Event 1 Start Date, Preparation x for Event 1 Start Time, Preparation x for Event 1 Length (in hours), Event 1 Title, Event 1 Start Date, Event 1 Start Time, Event 1 Length (in hours)]"\n\
}}\n\n\
Ensure that the total preparation hours add up to the amount provided.

"""

human_template = """
Event Title: {title}
Event Date: {date}
Event Time: {time}
Event Length: {length}
Event Preparation Hours: {prep}
Current Calendar: {calendar}

Please create a new event for my calendar, ensuring the total preparation time across all preparation periods adds up exactly to the Event Preparation Hours provided. Ensure that the preparation time and event time do not overlap with existing timeslots in the current calendar. 

"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[],
                                                    template=system_template)),
    HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['title','date','time','length','prep','calendar'],
                                                    template=human_template)),
])

llm = ChatOpenAI(temperature=0.0, model="gpt-3.5-turbo-0125", api_key=api_key)

chain = (prompt | llm)

def lambda_handler(event, context):
    title = event.get("title")
    date = event.get("date")
    time = event.get("time")
    length = event.get("length")
    prep = event.get("prep")
    calendar = event.get("calendar")

    response = chain.invoke({'title': title, 'date': date, 'time': time, 'length': length, 'prep': prep, 'calendar': calendar})
    json_response = json.loads(response.content)
    new_calendar = json_response.get("calendar")

    return {
        'statusCode': 200,
        'body': json.dumps({"new_calendar": new_calendar})
    }
