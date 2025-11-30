# Add an each method to return a CSVRow object. Use method_missing on that CSVRow to return the value for the column for a given heading.
class ReadCSV
  include Enumerable
  def read
    file = File.new(@name)
    @headers = file.gets.chomp.split(',')
    file.each do |row|
      @result.push(CSVRow.new(row.chomp.split(','), @headers))
    end
  end
  def headers
    @headers
  end
  def csv_contents
    @result
  end
  def initialize(name)
    @name = name
    @result = []
    read
  end
  
  def each(&block)
    @result.each{|entry| block.call entry} 
  end
end

class CSVRow

  def method_missing (name, *args)
    @content[name.to_s]
  end

  def initialize(contents, headers)
    @content = {}
    contents.each_with_index do |content, index|
      @content[headers[index]] = content
    end
  end

end


def main
  file = ReadCSV.new("test.csv")
  file.each do |row|
    puts row.header4
  end
end

main