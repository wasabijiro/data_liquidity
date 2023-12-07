import json
import os
import re
from pathlib import Path
from pprint import pprint
from typing import Any

import openai
from flask import Flask, jsonify, request
from flask_cors import CORS
from loguru import logger

app = Flask(__name__)
CORS(app)


class BackendClass:
    def __init__(self) -> None:
        openai.api_key = os.environ["OPENAI_API_KEY"]
        self.model: str = "gpt-3.5-turbo-16k"

        data_dir: Path = Path(__file__).parent.parent / "data"
        json_datafile: Path = data_dir / "data.json"
        with open(json_datafile, "r") as f:
            self.data: list[dict[str, Any]] = json.load(f)

    def make_system_message(self) -> str:
        system_message: str = f"""
        # Overview
        You are a professional trader who can determine creditworthiness.
        You can refer to your database of members and perfectly estimate the creditworthiness of users.

        # Todo
        Estimate the credibility of the user entered in user_message based on the database entered below.

        # Inside the database
        This database contains user IDs, balances, credit amounts, clearings, # number of delinquencies, transaction volume, credit, and protocols.
        This database contains information of 30 users and includes the following information.
        ID: User ID
        balance: The balance. The higher this amount is, the higher the user's credit rating. 500 ~ 15000.
        loan_amount: Loan amount. If this amount is exceeded, the user will not be able to receive credit. 1 ~ 300.
        liquidation: Number of liquidations. This is the number of times the user has liquidated. 500 ~ 15000.
        deferrals: Number of delinquencies. The number of times a user has been delinquent. The higher this value, the more points will be deducted. 1 ~ 100.
        transaction_volume: Transaction volume. The amount of money the user transacted. The higher this value is, the higher the credit score. 1 ~ 100.
        credit: Credit rating. You must estimate this value based on other information. 500 ~ 100000000.
        protocols: The protocols with which the user transacted. Represents the protocols with which the user has transacted.

        # Notes.
        - Output examples must be followed.
        - Output must be integer values only.
        - **The following format must be followed.**

        # Output format
        - json format
        - key: score, value: int
        - key: reason, value: str ** WRITE JAPAENSE **

        # Output examples
        {{
            "score": 13000,
            "reason": "ユーザの残高が多いので、クレジットスコアも高いと判断しました。"
        }},
        {{
            "score": 10000,
            "reason": "利用者の残高は中程度だが、延滞が多いため、クレジットスコアは低いと判断しました。"
        }}

        """

        return system_message

    def make_user_message(self, json_dict: dict[str, Any]) -> str:
        user_message: str = f"""
        The following is information on a user {json_dict["id"]}.
        This user's current balance is {json_dict["credit"]}, but this is not necessarily the true credit amount.
        So, estimate the amount of credit for this user based on the database entered.

        # User information
        ID: {json_dict["id"]}
        balance: {json_dict["balance"]}
        loan_amount: {json_dict["loan_amount"]}
        liquidation: {json_dict["liquidation"]}
        deferrals: {json_dict["deferrals"]}
        transaction_volume: {json_dict["transaction_volume"]}
        credit: {json_dict["credit"]}
        protocols: {json_dict["protocols"]}

        # Database
        """

        for json_dict in self.data:
            user_message += f"""
            ID: {json_dict["id"]}
            balance: {json_dict["balance"]}
            loan_amount: {json_dict["loan_amount"]}
            liquidation: {json_dict["liquidation"]}
            deferrals: {json_dict["deferrals"]}
            transaction_volume: {json_dict["transaction_volume"]}
            credit: {json_dict["credit"]}
            protocols: {json_dict["protocols"]}
            ----
        """
        return user_message

    def chat_completion(
        self, model: str, system_message: str, user_message: str
    ) -> str:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
        )
        response_text = response["choices"][0]["message"]["content"]
        return response_text


def execute(input_dict: dict[str, Any]) -> dict[str, int]:
    backend = BackendClass()
    response: str = backend.chat_completion(
        model=backend.model,
        user_message=backend.make_user_message(input_dict),
        system_message=backend.make_system_message(),
    )
    return response


# product
@app.route("/mercari", methods=["POST"])
def main() -> int:
    input_dict = request.get_json()
    print(input_dict)
    # print(request.get_json())
    response = execute(input_dict)
    return jsonify(response)


# test
def test() -> None:
    json_file: Path = Path(__file__).parent.parent / "data" / "sample.json"
    with open(json_file, "r") as json_file:
        test_dict = json.load(json_file)
    logger.info(f"input_file: {json_file.name}")
    logger.info("model loading...")
    response = execute(test_dict)
    logger.info(f"response: {response}")
    logger.info("model loaded")
    return response


if __name__ == "__main__":
    # _ = test()
    app.run(port=5003, debug=True)
