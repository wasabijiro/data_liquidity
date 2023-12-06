import json
import os
from pathlib import Path
from pprint import pprint
from typing import Any

import openai
from flask import Flask, jsonify
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
        Estimate the creditworthiness of the user entered in user_message based on the database entered below.

        # Inside the database
        This database includes user IDs, balances, credit amounts, clearing, number of delinquencies, transaction volume, credit, and protocols.

        # Notes.
        - Output examples must be followed.
        - Output must be integer values only.
        - **The following format must be followed.**

        # Output format
        - score = 10000

        # Output examples
        - score = 119311
        - score = 1325486
        - score = 0

        """

        return system_message

    def make_user_message(self, json_dict: dict[str, Any]) -> str:
        user_message: str = f"""
        The following is information on a user {json_dict["id"]}.
        This user's current balance is {json_dict["balance"]}, but this is not necessarily the true credit amount.
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

    # 出力にブレがある
    logger.info(f"response: {response}")
    response = response.split("=")[1].replace(" ", "")
    response = int(response)
    return response


# product
@app.route("/mercari", methods=["POST"])
def main(input_dict: dict[str, Any]) -> int:
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
    _ = test()
    # app.run(port=5003, debug=True)
