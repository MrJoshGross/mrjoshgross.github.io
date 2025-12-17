# add ops here and define behavior
OperatorTable addOperator("._.", 3)
Number ._. := method(other,
    return self + other
)

# have to call code that uses the above features separately as the parser only updates once
# thanks Jer - https://stackoverflow.com/a/68410820

# TODO Io rabbit hole project: implement something like "import" or @before that
# TODO does stuff and then sends doFile on the rest of the file
# TODO running idea is to split file into header and implementation akin to C++
# TODO worth a try...
# TODO isn't this what the importer does? look at old IoUnit project for clarity
doFile("work/cursed.io")