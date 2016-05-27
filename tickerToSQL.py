import csv
def main():
	filename = "companylist.csv"
	listEntries = {};
	with open(filename,'r') as csvfile:
		outFileName = "stockInfo.sql"
		outfile = open(outFileName,'a+')
		print("INSERT INTO stockInfo VALUES",file= outfile)
		reader = csv.reader(csvfile,delimiter = ',')
		skip = True
		for row in reader:
			if (skip):
				skip = False;
			else:
				listEntries[row[0]] = row[1];
		numEntries = len(listEntries)
		counter = 0; 
		for key in listEntries:
			print("(\"" + key.strip()+ "\",\"" + listEntries[key] + "\"," + str(1234567) + ")",file = outfile, end = "")
			if (counter != numEntries - 1):
				print(",",file = outfile)
			else:
				print(";",file = outfile)
			counter += 1; 


main()