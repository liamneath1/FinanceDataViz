import os, copy
from flask import Flask, jsonify, request, send_from_directory, make_response
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.heroku import Heroku

from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base



app = Flask(__name__, static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
engine = create_engine('postgres://jwnrvwczsmwahh:Eay8klzAFN5V0xljHial-krhxv@ec2-174-129-242-241.compute-1.amazonaws.com:5432/d4v4mh5fc6v6hu')

db = SQLAlchemy(app)


# ------------- GLOBAL VARIABLES -------------- #
tickerDictionary = {};

# ------------- GLOBAL VARIABLES -------------- #

# get root
@app.route("/")
def index():
	#db.session.execute("SELECT * FROM stockInfo;");
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