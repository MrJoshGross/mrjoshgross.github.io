class Tree
  attr_accessor :children, :name, :depth

  def initialize(glob = {}, depth=0)
    @name = glob.first[0]
    @children = []
    @depth = depth
    puts "For new glob named #{@name}"
    puts "Has children #{glob.first[1]}"
    glob.first[1].each do |c| 
      puts "Has child #{c}"
      children.push(Tree.new({c[0] => c[1]}, depth + 2))
    end
  end

  def visit_all(&block)
    visit &block
    children.each{|child| child.visit_all &block}
  end

  def visit(&block)
    block.call self
  end
end

# Write a simple GREP grep that will print the lines of a file having any occurrences of a phrase 
# anywhere in that line. Include line numbers.
def doGrep
  puts "Enter grep command in format stringToSearch filename.ext"
  query = gets
  string = query.split[0]
  name = query.split[1]
  File.open(name, "r") do |file|
    lineNumber = 1
    file.each_line do |line|
      puts "Line #{lineNumber}: #{line}" if line.include?(string)
      lineNumber += 1
    end
  end
end

# Print the contents of an array of 16 numbers, four numbers at a time, using just each. Now, do the same with each_slice in Enumerable.
def doArrayPrint
  arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  
  # each
  puts "4x4 with each"
  n = 0
  arr.each do |a|
    n += 1
    print("#{a} ") if n < 5
    if n == 4
      puts
      n = 0
    end
  end

  puts "4x4 with each_slice"
  # each_slice
  arr.each_slice(4) do |slice|
    slice.each{|a| print "#{a} "}
    puts
  end
end

# Let the tree initializer accept a nested structure of hashes like so:
#   {'grandpa' => {'dad' => 'child1 => {}, child2 => {}'}, {'uncle' => {child3 => {}, child4 => {}}}}
def doTreeStuff
  tree = Tree.new(
    {
      'grandpa' => 
      {
        'dad' => 
        {
          'child1' => {}, 
          'child2' => {}
        }, 
        'uncle' =>
        {
          'child3' => {}, 
          'child4' => {}
        }
      }
    }
  )

  puts "Visiting a node"
  tree.visit{|node| puts node.name}

  puts "Visiting entire tree"
  tree.visit_all do |node| 
    node.depth.times{print" "} 
    puts node.name
  end
end

def main
  puts "1: Arrays 2: Tree 3: Grep"
  choice = gets.to_i
  choice == 1 ? doArrayPrint : choice == 2 ? doTreeStuff : choice == 3 ? doGrep : raise('Invalid choice')
end

main