DROP TABLE IF EXISTS indexInformation;
CREATE TABLE indexInformation(
	id BIGINT primary KEY,
	index1Change FLOAT(5),
	index2Change FLOAT(5),
	index3Change FLOAT(5),
	index4Change FLOAT(5),
	timeOfUpdate CHAR(128)
);
INSERT INTO indexInformation VALUES
(0,7.5,-2.5,4.4,2.0,'June 4, 2016')