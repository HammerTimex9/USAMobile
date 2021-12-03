
export class Token {
  networkId: string;
  name: string;
  symbol: string;
  address: string;
  description: string;
  type: string;
  image: string;

  constructor({ networkId, name, symbol, address, description, type, image }) {
    this.networkId = networkId;
    this.name = name;
    this.symbol = symbol;
    this.address = address;
    this.description = description;
    this.type = type;
    this.image = image;
  }

  compareName(name: string) {
    return this.name.toLowerCase() === name.toLowerCase().trim();
  }
}

export class Tokens extends Array {
  query(query: string) {
    if (!this.length || query === '') {
      return [];
    }

    const regex = new RegExp(`${query.trim()}`, 'i');
    return new Tokens(
      ...this.filter((token) => token.name.search(regex)>= 0)
    );
  }
}
