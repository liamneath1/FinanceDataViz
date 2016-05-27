import os, copy
from flask import Flask, jsonify, request, send_from_directory, make_response
from flask.ext.sqlalchemy import SQLAlchemy, create_engine
from flask.ext.heroku import Heroku

app = Flask(__name__, static_url_path='')
db = SQLAlchemy(app)
engine = create_engine(mysql://b75138debf5a13:3feeda96@us-cdbr-iron-east-04.cleardb.net/heroku_008ccd5733b3459?reconnect=true)



# ------------- GLOBAL VARIABLES -------------- #
tickerDictionary = {};

# ------------- GLOBAL VARIABLES -------------- #

# get root
@app.route("/")
def index():
    return app.make_response(open('app/index.html').read())
# send assets (ex. assets/js/random_triangle_meshes/random_triangle_meshes.js)
# blocks other requests, so your directories won't get listed (ex. assets/js will return "not found")
@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('app/assets/', path)

if __name__ == "__main__":
	port = int(os.environ.get("PORT", 5050))
	app.run(host='0.0.0.0', port=port, debug=True)

# set debug=True if you want to have auto-reload on changes
# this is great for developing