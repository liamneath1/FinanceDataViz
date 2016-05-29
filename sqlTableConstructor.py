import csv
def main():
	filename = "companylist.csv"
	listEntries = {};
	with open(filename,'r') as csvfile:
		reader = csv.reader(csvfile,delimiter = ',')
		skip = True
		for row in reader:
			if (skip):
				skip = False;
			else:
				listEntries[row[0]] = [row[1].replace("'", ""),row[3].replace("'", ""),row[5].replace("'", ""),row[6].replace("'", "")];
	filename = "quandlDataSet.csv"
	with open(filename,'r') as csvfile:
		reader = csv.reader(csvfile,delimiter =',')
		numSim = 0; 
		for row in reader:
			key = (row[0])[5:]	# take off the WIKI/ part
			if key in listEntries:
				numSim += 1
			else:
				endLoc = (row[1]).find('(')
				cmpName = (row[1])[:endLoc].replace("'", "")
				listEntries[key] = [cmpName,"na","na","na"]
	outFileName = "stockInfoTest.sql"
	outfile = open(outFileName,'a+')
	print("DROP TABLE IF EXISTS stockInfo;",file = outfile)
	print("CREATE TABLE stockInfo(",file = outfile)
	print("id BIGINT primary KEY,",file = outfile)
	print("tickerName CHAR(64),",file = outfile)
	print("companyName CHAR(64),",file = outfile)
	print("marketCap CHAR(64),",file = outfile)
	print("sector CHAR(64),", file = outfile)
	print("industry CHAR(64));", file = outfile)
	print("INSERT INTO stockInfo VALUES",file= outfile)
	numEntries = len(listEntries)
	counter = 0;
	for key in listEntries:    
		print( "(" + str(counter) + ",'" + key.strip()+ "','" + (listEntries[key])[0] + "','" + (listEntries[key])[1] + "','" + (listEntries[key])[2] + "','" +(listEntries[key])[3] + "')",file = outfile, end = "")
		if (counter != numEntries - 1):
			print(",",file = outfile)
		else:
			print(";",file = outfile)
		counter += 1; 


main()