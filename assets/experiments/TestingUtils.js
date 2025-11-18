function assertEquals(claim, expected, actual){
    if(expected !== actual) throw new Error(`${claim} expected ${expected} but was ${actual}`);
    else console.log(`${claim} expected ${expected}, was ${actual}`);
}

function expectError(claim, func){
    try{
        func();
        console.error(`Expected error when ${claim} but did not get one.`);
    } catch(e){
        console.log(`Error occured as expected: ${e} with claim ${claim}`);
    }
}