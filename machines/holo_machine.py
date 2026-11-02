from dataclasses import dataclass
from machines.base_machine import BaseMachine


@dataclass
class HoloMachine(BaseMachine):
    name: str = "HoloMachine"
    filled: int = 1
