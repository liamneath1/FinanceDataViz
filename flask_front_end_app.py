import os, copy
import json, collections
from flask import Flask, jsonify, request, send_from_directory, make_response
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.heroku import Heroku

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


from sqlalchemy.orm import scoped_session, sessionmaker, Query

app = Flask(__name__, static_url_path='')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']	#primary key is ID??
engine = create_engine('postgres://jwnrvwczsmwahh:Eay8klzAFN5V0xljHial-krhxv@ec2-174-129-242-241.compute-1.amazonaws.com:5432/d4v4mh5fc6v6hu')

Base = declarative_base()
Base.metadata.reflect(engine)
from sqlalchemy.orm import relationship, backref
class Users(Base):
    __table__ = Base.metadata.tables['stockinfo']



#db = SQLAlchemy(app)
# ------------- GLOBAL VARIABLES -------------- #
tickerDictionary = {};
db_session = None 

# ------------- GLOBAL VARIABLES -------------- #
# get root
@app.route("/")
def index():
    global db_session
    db_session = scoped_session(sessionmaker(bind=engine))
    #res = db_session.execute("SELECT * FROM stockinfo;");
    #return (app.make_response(json.dumps([dict(r) for r in res])))

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