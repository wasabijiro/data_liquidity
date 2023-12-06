import json
import random
from pathlib import Path
from typing import Any

from loguru import logger


class MakeSampleDataClass:
    def __init__(self):
        self.data_dir: Path = Path(__file__).parent.parent / "data"
        self.original_data: dict[str, Any] = {
            "id": "0x438D35f5420E58A63875B17AF872782be3878bd3",
            "balance": 10000,
            "loan_amount": 100000,
            "liquidation": 100000,
            "deferrals": 10000,
            "transaction_volume": 10000,
            "credit": 100000,
            "protocols": {"1": "aave", "2": "uniswapv3_lp", "3": "maker_dao"},
        }

    def make_sample_data(self) -> None:
        data_points = []
        for _ in range(30):
            new_data = self.original_data.copy()

            new_data["id"] = "0x" + "".join(
                [random.choice("0123456789ABCDEF") for _ in range(40)]
            )
            new_data["balance"] = random.randint(5000, 20000)
            new_data["loan_amount"] = random.randint(50000, 150000)
            new_data["liquidation"] = random.randint(50000, 150000)
            new_data["deferrals"] = random.randint(5000, 20000)
            new_data["transaction_volume"] = random.randint(5000, 20000)
            new_data["credit"] = random.randint(50000, 150000)
            new_data["protocols"] = [f"test{i}" for i in range(1, random.randint(1, 5))]

            data_points.append(new_data)
            self.write_json(data_points)

    def write_json(self, data_points: list[dict[str, Any]]) -> None:
        self.data_dir.mkdir(exist_ok=True)
        with open(self.data_dir / "data.json", "w") as json_file:
            json.dump(data_points, json_file, indent=4)


def main() -> None:
    App = MakeSampleDataClass()
    App.make_sample_data()
    logger.info("Data has been written to data.json.")


if __name__ == "__main__":
    main()
