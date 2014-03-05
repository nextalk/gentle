Gentle -- (Development)
===================

A website sofeware for database(mysql) management 


Usage
-------------------

###Command

Start a simple server

	gentle -u root -p public mysql

###Parse setting form the comment

name|type(extra)//help

example:

	Category|select([[0,"Default"],[1,"Life"],[2,"News"]])//Select the category

For Developer
-------------------

	npm install
	git submodule update --init
	grunt
