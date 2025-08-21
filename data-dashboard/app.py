from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files["file"]
        if file:
            df = pd.read_csv(file)
            data = df.head(20).to_dict(orient="records")
            columns = df.columns.tolist()
            return render_template("dashboard.html", data=data, columns=columns)
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5001)
