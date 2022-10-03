//import { Num } from '../src/index'

class Num {
    value: number

    constructor(n: number) {
        this.value = n
    }

    val(): number {
        return this.value
    }

    add(n2: Num): Num {
        this.value += n2.val()
        return this
    }

    toString(): string {
        return this.val().toString()
    }

    static addAll(numArr: Array<Num>): Num {
        return new Num(numArr.map((n) => n.val()).reduce((a, b) => a + b, 0))
    }
}

test('add', () => {
    expect(new Num(5).add(new Num(6)).val()).toBe(11)
})

test('toString', () => {
    expect(new Num(5).toString()).toBe('5')
})

test('addAll', () => {
    expect(Num.addAll([new Num(5), new Num(2), new Num(13)]).val()).toBe(20)
})
