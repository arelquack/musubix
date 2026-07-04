#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Client,
    Freelancer,
    Amount,
    IsFunded,
    IsApproved,
}

const NATIVE_TOKEN: Symbol = symbol_short!("NATIVE");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the escrow with the client, freelancer, and the amount of native token to lock.
    pub fn initialize(env: Env, client: Address, freelancer: Address, amount: i128) {
        // Prevent re-initialization
        if env.storage().instance().has(&DataKey::Client) {
            panic!("Escrow is already initialized");
        }

        // Require authorization from the client to set up the contract
        client.require_auth();

        // Save state
        env.storage().instance().set(&DataKey::Client, &client);
        env.storage().instance().set(&DataKey::Freelancer, &freelancer);
        env.storage().instance().set(&DataKey::Amount, &amount);
        env.storage().instance().set(&DataKey::IsFunded, &false);
        env.storage().instance().set(&DataKey::IsApproved, &false);

        // Publish event
        env.events().publish(
            (symbol_short!("init"),),
            (client, freelancer, amount),
        );
    }

    /// The client calls this to deposit funds into the smart contract.
    pub fn deposit(env: Env, token_contract: Address) {
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();
        let is_funded: bool = env.storage().instance().get(&DataKey::IsFunded).unwrap();

        if is_funded {
            panic!("Escrow is already funded");
        }

        client.require_auth();

        // Transfer tokens from client to this contract
        let token_client = token::Client::new(&env, &token_contract);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        env.storage().instance().set(&DataKey::IsFunded, &true);

        env.events().publish(
            (symbol_short!("deposit"),),
            (client, amount),
        );
    }

    /// The client calls this to approve the work and release funds to the freelancer.
    pub fn approve_and_pay(env: Env, token_contract: Address) {
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let freelancer: Address = env.storage().instance().get(&DataKey::Freelancer).unwrap();
        let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();
        let is_funded: bool = env.storage().instance().get(&DataKey::IsFunded).unwrap();
        let is_approved: bool = env.storage().instance().get(&DataKey::IsApproved).unwrap();

        if !is_funded {
            panic!("Escrow is not funded yet");
        }
        if is_approved {
            panic!("Escrow is already approved and paid");
        }

        client.require_auth();

        // Transfer from contract to freelancer
        let token_client = token::Client::new(&env, &token_contract);
        token_client.transfer(&env.current_contract_address(), &freelancer, &amount);

        env.storage().instance().set(&DataKey::IsApproved, &true);

        env.events().publish(
            (symbol_short!("approved"),),
            (freelancer, amount),
        );
    }
}
