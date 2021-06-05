const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
   
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    console.log(accounts);
    console.log(`Contarct Address: ${await instance.contarctAddress.call()}`);
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    console.log(`Contarct Address: ${await instance.contarctAddress.call()}`);
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

// Users will exchange starts
  it('lets user1 and user 2 exchange their stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    console.log("user1", user1);
    console.log("user2", user2);

    let tokenId1 = 101;
    let tokenId2 = 201;

    await instance.createStar('Polaris', tokenId1, {from: user1})
    await instance.createStar('Vega', tokenId2, {from: user2})

    let star1 = await instance.lookUptokenIdToStarInfo(tokenId1, {from: accounts[2]});
    console.log("star 1 before exchange", star1);

    let star2 = await instance.lookUptokenIdToStarInfo(tokenId2, {from: accounts[2]});
    console.log("star 2 before exchange", star2);

    await instance.exchangeStars(tokenId1, tokenId2, {from: user1});

    let star1new = await instance.lookUptokenIdToStarInfo(tokenId1, {from: accounts[2]});
    console.log("star 1 after exchange", star1new);

    let star2new = await instance.lookUptokenIdToStarInfo(tokenId2, {from: accounts[2]});
    console.log("star 2 after exchange", star2new);

    console.log(star1[1]+star2[1]);

    assert.equal(star1[1]+star2[1], star2new[1]+star1new[1]);
});

// User transfer star
it('lets user1 transfer their star', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    console.log("user1", user1);
    console.log("user2", user2);

    let tokenId1 = 105;
 
    await instance.createStar('Polaris', tokenId1, {from: user1})

    let star1 = await instance.lookUptokenIdToStarInfo(tokenId1, {from: accounts[2]});
    console.log("star 1 before transfer", star1);

    await instance.transferStars(user2, tokenId1, {from: user1});

    let star1new = await instance.lookUptokenIdToStarInfo(tokenId1, {from: accounts[2]});
    console.log("star 1 after transfer", star1new);

    let starOwner = star1new[1];

    assert.equal(user2,starOwner);
});