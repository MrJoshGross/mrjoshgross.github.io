# fib, iter and recur

fibRecursive := method(n,
    if(n <= 0, return 0)
    if(n == 1, return 1, return fibRecursive(n-1) + fibRecursive(n-2))
)

"Recursive fibonacci\n" println
for(i, -1, 10, fibRecursive(i) println)

fibIterative := method(n, 
    if(n <= 0, return 0)
    if(n == 1, return 1)
    current := 1
    last := 1
    for(i, 2, n-1, 
        temp := current
        current = current + last
        last = temp 
    )
    return current
)

"\nIterative fibonacci\n" println
for(i, -1, 10, fibIterative(i) println)

# NOTE: for loop upper bounds are inclusive (<=)


# change / to return 0 if denominator is zero
# thinking idea is to store the primitive division operation in a slot
# then call that slot with the denominator as argument when appropriate.
Number divisionOp ::= Number getSlot("/")
Number / = method(other, 
    if(other == 0 or other == nil, 0, 
        self divisionOp (other)
    )
)

"Updating numeric division operation" println
"6 / 0 is now 0: " print
(6/0) println

"6 / 1 is still 6: " print
(6/1) println

# worked pretty well..

# Write a program to add up all the numbers in a two dimensional array.
# create two dimensional "array"
numbers := list(
    list(1, 3, 6),
    list(4, 12, 9),
    list(7.5, 4, 2)
)

"Summing list " println
numbers println

total := 0
# for each row in the list
numbers foreach(row, 
    # for each value in the row
    row foreach(val, 
        total = total + val
    )
)

("Total: " .. total) println

# add a slot called myAverage to a list the computes the average of all the numbers in a list. Bonus: raise an Io exception if any items are not a number.

List myAverage := method(
    total := 0
    self foreach(val,
        if(val proto == Number, total = total + val, Exception raise("Element not a number.") )
    )
    return total / self size
)


("Average of 0 row: " .. numbers at(0) myAverage) println
("Average of 1 row: " .. numbers at(1) myAverage) println
("Average of 2 row: " .. numbers at(2) myAverage) println
# list(1, 2, 3, "four") myAverage println // raises an exception because "four" is not a number.

# write a prototype for a two dimensional list. dim(x, y) should allocate a list of y lists of size x. Create a setter and getter as expected.
# bonus: write a transpose method which swaps x, y with a new 2DList y, x.
2DList := Object clone do(
    # internal list to store other lists
    base := nil

    # creates 2D list structure that has dimension x by y
    dim := method(x, y,
        if(x < 1 or y < 1, Exception raise ("List dimensions must be positive."))
        self base = list()
        for(i, 1, y, 
            newList := list()
            for(j, 1, x, 
                newList append (nil)
            )
            self base append(newList)
        )
        self x := x
        self y := y
    )

    # get element at index x,y
    get := method (x, y, 
        if(x < 0 or y < 0, Exception raise("Indices must be positive"))
        if(y >= self y, Exception raise("Index #{y} must be less than dimension #{self y}" interpolate))
        row := self base at(y)
        if(x >= self x, Exception raise("Index #{x} must be less than dimension #{self x}" interpolate))
        return row at(x)
    )

    # set element at index x,y to val
    set := method(x, y, val, 
        if(x < 0 or y < 0, Exception raise("Indices must be positive"))
        if(y >= self y, Exception raise("Index #{y} must be less than dimension #{self y}" interpolate))
        row := self base at(y)
        if(x >= self x, Exception raise("Index #{x} must be less than dimension #{self x}" interpolate))
        row atPut(x, val)
    )

    # creates new matrix with dimensions y, x and elements in the appropriate places
    transpose := method(
        newList := 2DList clone
        newList dim(self y, self x)
        for(y, 0, self y - 1, 
            for(x, 0, self x - 1, 
                newList set(y, x, self get(x, y))    
            )
        )
        return newList
    )

    # writes 2D list structure to file
    # val,val,val\nval...
    writeToFile := method(fileName,
        f := File with(fileName .. ".txt")
        f remove
        f openForUpdating
        "Writing this list to file" println
        self printList
        f write(self x .. " " .. self y .. "\n")
        self base foreach(rowIndex, row, 
            row foreach(valueIndex, value,
                if (valueIndex == self x - 1, f write(value asString), f write(value .. " ")) 
            )
            if(rowIndex != self y - 1, f write("\n"))
        )
        f close
    )
    
    # reads 2D list structure from file
    # val,val,val\nval...
    readFromFile := method(fileName, 
        f := File with(fileName .. ".txt")
        f openForReading
        fileList := f contents split select(x, x != "")
        newList := 2DList clone
        newList dim(fileList at(0) asNumber, fileList at(1) asNumber)
        newRow := List clone
        for(i, 2, fileList size - 1,
            index := i - 2
            newList set(index % newList x, index / newList x, fileList at(i))
        )
        "List from file" println
        return newList
    )

    # print 2D list structure
    printList := method(
        self base foreach(row,
            row foreach(value, 
                (value .. " ") print
            )
            "" println
        )
    )
)

example := 2DList clone 
example dim(3, 2)

"2DList proto creation" println
example printList
example get(2,1) println
example set(2,1,1)
example printList
example get(2,1) println 
example transpose printList ; "" println

example writeToFile("test")
example transpose writeToFile("test2")

2DList readFromFile("test") printList
2DList readFromFile("test2") printList

# Write a program that gives you ten tries to guess a random number from 1-100
# If you would like, give a hint of "hotter" or "colder" after the first guess.

# aint no way I'm typing all that to get input
readLine := method(prompt,
    prompt println
    File standardInput readLine 
)

answer := (Random value(0, 100) + 1) floor
oldGuess := -100
10 repeat(
    newGuess := readLine("Enter a number between 1 and 100, inclusive") asNumber
    if(newGuess == answer) then(
        "You win!" println 
        break 
    ) else(
        if((newGuess - answer) abs < (oldGuess - answer) abs) then(
            "Warmer" println
        ) else(
            "Colder" println
        )
    )
    oldGuess = newGuess
)

