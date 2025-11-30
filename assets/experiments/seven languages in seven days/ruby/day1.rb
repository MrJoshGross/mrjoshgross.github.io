# Print the string "Hello, world"
puts "Hello, world"

# For the string "Hello, Ruby." find the index of the word "Ruby."
puts "Hello, Ruby.".index("Ruby.")

# Print your name ten times.
for i in 1..10 do
    puts "Mr. G"
end

# Print the string "This is sentence number 1." where the number 1 changes from 1 to 10.
for i in 1..10 do
    puts "This is sentence number #{i}"
end

# Run a Ruby program from a file (easily done..)

# Bonus: Write a program that picks a random number, then takes guesses from the user, indicating if their guess is too low or too high, until they guess the number
randomNum = rand(10)
puts "begin"
loop do
    puts "Guess a number between 1 and 10"
    guess = gets.to_i # interesting syntax..
    puts guess > randomNum ? "Lower" : guess < randomNum ? "Higher" : "Correct!"
    break if guess == randomNum
end
puts "end"