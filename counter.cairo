#[starknet::contract]
mod Counter {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        value: felt
    }

    @view
    fn getValue() -> felt {
        return value;
    }

    @external
    fn increment() -> felt {
        let value = value + 1;
        return value;
    }

    @external
    fn decrement() -> felt {
        let value = value - 1;
        return value;
    }

    @external
    fn add(amount: felt) -> felt {
        let value = value + amount;
        return value;
    }

}