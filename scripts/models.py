from pydantic import BaseModel

class HistoricalEvent(BaseModel):
    id: str
    title: str
    year: int
    date: str
    country: str
    division: str
    description: str
    longDescription: str
    imagePrompt: str
    relevanceScore: int

class EventCollection(BaseModel):
    events: list[HistoricalEvent]