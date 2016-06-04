DROP TABLE IF EXISTS indexInfo;
CREATE TABLE indexInfo(
	id BIGINT primary KEY,
	indexOneChange FLOAT(5),
	indexTwoChange FLOAT(5),
	indexThreeChange FLOAT(5),
	timeOfUpdate CHAR(128)
);
INSERT INTO indexInfo VALUES
(0,2.5,-2.5,3.4,'June 4, 2016')