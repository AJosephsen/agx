/**
 * Simple TypeScript playground.
 * Run with: npx ts-node playground/main.ts <your-name>
 */

type Sex = 'female' | 'male' | 'other';

class Person {
    constructor(public name: string, public sex: Sex) {}

    describe(): string {
        return `${this.name} (${this.sex})`;
    }
}

type Greeting = {
    person: Person;
    timestamp: Date;
};

function makeGreeting(person: Person): Greeting {
    return {
        person,
        timestamp: new Date()
    };
}

const nameFromCli = process.argv[2] ?? 'world';
const sexFromCliInput = process.argv[3];
const allowedSexes: ReadonlyArray<Sex> = ['female', 'male', 'other'];
const sexFromCli = allowedSexes.includes(sexFromCliInput as Sex) ? (sexFromCliInput as Sex) : 'other';

const person = new Person(nameFromCli, sexFromCli);
const greeting = makeGreeting(person);

console.log(`Hello, ${greeting.person.name}!`);
console.log(`Generated at: ${greeting.timestamp.toISOString()}`);
console.log(`Person info: ${person.describe()}`);
