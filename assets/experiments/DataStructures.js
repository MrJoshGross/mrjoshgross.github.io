class LLNode{
    constructor(data, next = null){
        this.data = data;
        this.next = next;
    }
}


class LinkedList{
    constructor(){
        this.head = null;
        this.length = 0;
    }

    // this is sick
    [Symbol.iterator]() {
        let iterationNode = null;
        return {
            next: () => {
                if(iterationNode == null && this.head){
                    iterationNode = this.head;
                    return {value: iterationNode, done: false};
                } else if(iterationNode && iterationNode.next){
                    iterationNode = iterationNode.next;
                    return {value: iterationNode, done: false};
                } else{
                    iterationNode = null;
                    return {value: undefined, done: true};
                }
            }
        }
    }

    add(value, index){
        if(index < 0 || index > this.length) throw new Error("Invalid index: " + index);
        let nodeToAdd = new LLNode(value);
        if(this.head == null) this.head = nodeToAdd;
        else if(index == 0){
            nodeToAdd.next = this.head;
            this.head = nodeToAdd;
        }
        else{
            let currentIndex = 0;
            let currentNode = this.head;
            let insertionIndex = index && index < this.length ? index : this.length;
            while(currentIndex < insertionIndex-1){
                currentNode = currentNode.next;
                currentIndex++;
            }
            if(currentNode.next) nodeToAdd.next = currentNode.next;
            currentNode.next = nodeToAdd;
        }
        this.length++;  
    }

    contains(value){
        for(let node of this)
            if(node.data == value) 
                return true;
        return false;
    }

    removeAtIndex(index){
        if(this.length == 0) throw new Error("Attempting to remove from an empty list");
        else if(index >= this.length) throw new Error("Index is larger than length of list");
        else if(index == 0 && this.head){
            let oldHead = /* mr gross*/ this.head;
            this.head = this.head.next;
            return oldHead.data;
        }
        else{
            let currentIndex = 0;
            let currentNode = this.head;
            while(currentIndex < index){
                if(!currentNode.next) throw new Error("Node at index " + currentIndex + " has no next reference.");
                else{
                    currentNode = currentNode.next;
                    currentIndex++;
                }
            }
            if(currentNode && currentNode.next){
                let nodeToRemove = currentNode.next;
                currentNode.next = nodeToRemove.next;
                return nodeToRemove.data;
            }
        }
        this.length--;
    }

    removeValue(value){
        if(this.length == 0) throw new Error("Attempting to remove from an empty list");
        else if(this.head.data == value){
            this.head = this.head.next;
            this.length--;
        }
        else{
            let currentNode = this.head;
            while(currentNode && currentNode.next){
                if(currentNode.next.data == value){
                    currentNode.next = currentNode.next.next;
                    this.length--;
                    break;
                }
                currentNode = currentNode.next;
            }
        }
    }

    get(index){
        if(this.length == 0) throw new Error("Attempting to get from an empty list");
        else if(index < 0) throw new Error("Attempting to get element at negative index: " + index);
        else if(index >= this.length) throw new Error("Index is larger than length of list");
        else{
            let currentIndex = 0;
            let currentNode = this.head;
            while(currentIndex < index){
                if(!currentNode.next) throw new Error("Node at index " + currentIndex + " has no next reference.");
                else{
                    currentNode = currentNode.next;
                    currentIndex++;
                }
            }
            return currentNode.data;
        }
    }

    set(value, index){
        if(index < 0 || index >= this.length) throw new Error("Invalid index: " + index);
        let currentNode = this.head;
        let currentIndex = 0;
        while(currentIndex < index){
            currentNode = currentNode.next;
            currentIndex++;
        }
        currentNode.data = value;

        // once set is properly tested, can (probably) replace with:
        // let before = this.get(index-1);
        // before.next.data = value;
    }

    toString(){
        if(this.head == null) return "[]"
        let currentNode = this.head;
        let string = "[";
        while(currentNode.next){
            string += (currentNode.data + " -> ");
            currentNode = currentNode.next;
        }
        string += currentNode.data + "]";
        return string;
    }
}

class LLStack{
    constructor(){
        this.list = new LinkedList();
    }

    peek(){
        return this.list.head.value;
    }

    isEmpty(){
        return this.list.head == null;
    }

    size(){
        return this.list.length;
    }

    push(value){
        this.list.add(value, 0);
    }

    contains(value){
        return this.list.contains(value);
    }

    pop(){
        if(this.list.length == 0) throw new Error("Trying to pop an empty stack");
        return this.list.removeAtIndex(0);
    }

    toString(){
        let string = "TOP\n";
        for(let node of this.list)
            string += node.data + "\n";
        string += "BOTTOM"
        return string;
    }
}

