import openai
from flask_cors import CORS
from flask import Flask, jsonify
from loguru import logger
import os
from pprint import pprint
from typing import Any
from pathlib import Path
import json

app = Flask(__name__)
CORS(app)

class BackendClass:
    def __init__(self) -> None:
        openai.api_key = os.environ["OPENAI_API_KEY"]
        self.model: str = "gpt-3.5-turbo-16k"

        data_dir: Path = Path(__file__).parent / "data"
        json_datafile: Path = data_dir / "data.json"
        with open(json_datafile, "r") as f:
            self.data: list[dict[str, Any]] = json.load(f)


    def make_system_message(self) -> str:
        system_message: str = f"""あなたは与信度を決定できるプロのトレーダーです。
        下記に入力されるデータベースをもとに、user_messageに入力されたユーザの与信度を推定してください。

        このデータベースには、ユーザのID、残高、与信額、清算、延滞回数、取引量、信用、プロトコルが含まれています。
        # データベース

        """

        for json_dict in self.data:
            system_message += f"""
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
        return system_message

    def make_user_message(self, json_dict: dict[str, Any]) -> str:
        user_message: str = f"""
        下記はとあるユーザ {json_dict["id"]} の情報です。
        このユーザの現在の残高は {json_dict["balance"]} であるが、これが本当の与信額であるとは限らないです。

        そこで、入力されたデータベースをもとに、このユーザの与信額を推定してください。

        # 注意事項
        - 出力例は必ず守ること
        - 出力は整数値のみであること

        # 出力例
        - 10000
        - 20000

        # ユーザ情報
        ID: {json_dict["id"]}
        balance: {json_dict["balance"]}
        loan_amount: {json_dict["loan_amount"]}
        liquidation: {json_dict["liquidation"]}
        deferrals: {json_dict["deferrals"]}
        transaction_volume: {json_dict["transaction_volume"]}
        credit: {json_dict["credit"]}
        protocols: {json_dict["protocols"]}

        # データベース
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

    def chat_completion(self, model: str, system_message: str, user_message: str) -> str:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
        )
        response_text = response["choices"][0]["message"]["content"]
        logger.info(f"response_text: {response_text}")
        return response_text

def execute(input_dict: dict[str, Any]) -> dict[str, int]:
    backend = BackendClass()
    response: str = backend.chat_completion(
        model=backend.model,
        user_message=backend.make_user_message(input_dict),
        system_message=backend.make_system_message(),
    )

    logger.info(f"response: {response}")
    return response

# 本番
@app.route('/mercari', methods=['POST'])
def main(input_dict: dict[str, Any]) -> int:
    response = execute(input_dict)
    return jsonify(response)

# テスト
def test() -> None:
    with open('./data/sample_input.json', 'r') as json_file:
        test_dict = json.load(json_file)
    response = execute(test_dict)
    return response
if __name__ == '__main__':
    test()
    # app.run(port=5003, debug=True)
