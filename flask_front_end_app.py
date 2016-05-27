import os, copy
from flask import Flask, jsonify, request, send_from_directory, make_response
app = Flask(__name__, static_url_path='')

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
	global tickerDictionary
	filename = "app/companylist.csv"
	src = open(filename, 'r')
	numTickers = len(data)
	for i in range (0, numTickers):
		line = data[i].split(",")
		tickerDictionary[line[0]] = (line[1])


	port = int(os.environ.get("PORT", 5050))
	app.run(host='0.0.0.0', port=port, debug=True)

# set debug=True if you want to have auto-reload on changes
# this is great for developing