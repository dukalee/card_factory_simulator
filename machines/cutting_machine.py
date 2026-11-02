from dataclasses import dataclass
from machines.base_machine import BaseMachine


@dataclass
class CuttingMachine(BaseMachine):
    name: str = "CuttingMachine"
    loc: int = 1
