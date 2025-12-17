(1+1) println
# (1+"one") print error as "one" is a Sequence, not a Number --> strongly typed
if (0, "true" println, "false" println) # 0 is true
if ("", "true" println, "false" println) # empty string is true
if (nil, "true" println, "false" println) # nil is false

Object slotNames println # prints supported slots as list

/*
::=	Creates slot, creates setter, assigns value
:=	Creates slot, assigns value
=	Assigns value to slot if it exists, otherwise raises exception

From https://iolanguage.org/guide/guide.html

::= creates an immutable (constant) slot, whereas 
:= creates a mutable (updatable) slot, and
= can only be used to assign to an existing slot.
*/

# Execute the code in a slot given its name.
# Creates test object and test method that prints a parameter.
# Then execute the testmethod.
Test := Object clone
Test testMethod := method(text, text println)
Test testMethod ("w")