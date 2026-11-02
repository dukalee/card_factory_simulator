from dataclasses import dataclass
from machines.base_machine import BaseMachine


@dataclass
class InkMachine(BaseMachine):
    name: str = "InkMachine"
    ink: int = 1
