type Getters<Type> = {
  [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};

interface Person {
  name: string;
  age: number;
  location: string;
}

type LazyPerson = Getters<Person>;

type Test<T> = {
  [U in keyof T as`get${Capitalize<string & U>}`]: T[U]
};
// type TestPerson = Test<Person>;

type MappedNewProperties<Type> = {
  [U in keyof Type as `test${Capitalize<string & U>}`]: Type[U]
}
type TestPerson = MappedNewProperties<Person>;
