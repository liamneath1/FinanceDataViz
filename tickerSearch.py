

def main():
	filename = "companyList.csv";
	src = open(filename, 'r');
	tickerDictionary = {};
	resultDictionary = {};
	print ('Reading in the map');
	data = src.read().splitlines();
	print (data[1]);
	numTickers = len(data);
	for i in range(0,numTickers):
		line = data[i].split(",");
		print(line[0])
		tickerDictionary[line[0]] = (line[1]);
	searchTerm = input ("Please enter your search term: ");
	numChars = len(searchTerm)
	found = False; 
	for key in tickerDictionary:
		for i in range(0,numChars):
			if searchTerm[i] != key[i + 1]:	# account for the initial "
				break;
			if (i == numChars - 1):
				found = True; 
		if (found):
			resultDictionary[key] = tickerDictionary[key]
		found = False; 


	print(resultDictionary)


	

main()