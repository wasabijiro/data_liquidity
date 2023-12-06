import json
import random
from pathlib import Path

original_data = {
    "id": "0x438D35f5420E58A63875B17AF872782be3878bd3",
    "balance": 10000,
    "loan_amount": 100000,
    "liquidation": 100000,
    "deferrals": 10000,
    "transaction_volume": 10000,
    "credit": 100000,
    "protocols": {
        "1": "aave",
        "2": "uniswapv3_lp",
        "3": "maker_dao"
    }
}

data_points = []
for _ in range(30):
    new_data = original_data.copy()

    new_data["id"] = "0x" + "".join([random.choice("0123456789ABCDEF") for _ in range(40)])
    new_data["balance"] = random.randint(5000, 20000)
    new_data["loan_amount"] = random.randint(50000, 150000)
    new_data["liquidation"] = random.randint(50000, 150000)
    new_data["deferrals"] = random.randint(5000, 20000)
    new_data["transaction_volume"] = random.randint(5000, 20000)
    new_data["credit"] = random.randint(50000, 150000)
    new_data["protocols"] = [f"test{i}" for i in range(1, random.randint(1, 5))]

    data_points.append(new_data)


data_dir: Path = Path(__file__).parent / "data"
data_dir.mkdir(exist_ok=True)
with open(data_dir / "data.json", 'w') as json_file:

    json.dump(data_points, json_file, indent=2)

print("Data has been written to data.json.")
