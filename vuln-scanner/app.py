from flask import Flask, render_template, request
import requests

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        url = request.form["url"]
        if not url.startswith("http"):
            url = "http://" + url

        result = {"url": url, "https": False, "headers": {}}

        try:
            r = requests.get(url)
            result["https"] = url.startswith("https")
            # Check for some headers
            security_headers = ["Content-Security-Policy", "X-Frame-Options", "Strict-Transport-Security"]
            for h in security_headers:
                result["headers"][h] = r.headers.get(h, "Missing")
        except:
            result["error"] = "Could not fetch URL."

        return render_template("result.html", result=result)
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
