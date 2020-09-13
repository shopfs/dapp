import { logReceipt } from "../helpers";
import { ipfsService } from "./ipfs.service";

export const marketService = {
    getFile,
    getAllFiles,
    getBuyerFiles,
    checkHashExists,
    getPriceLimit,
    getFileCount,
    buy,
    sell,
    createSubscription,
    withdrawSubscriptionAmount,
    cancelSubscription,
    isValidStream,
    getSubscriptionInfo,
    updateSubscriptionInfo,
    disableSubscriptionInfo,
    getStreamBalance
};

async function getFile(market, fileId) {
    let file = await market.methods.Files(parseInt(fileId)).call();
    const metadata = await ipfsService.getMetadata(file.metadataHash);
    return { ...file, metadata };
}

async function getFileCount(market) {
    return await market.methods.fileCount().call();
}

async function getPriceLimit(market) {
    const priceLimit = await market.methods.priceLimit().call();
    return priceLimit;
}

async function checkHashExists(market, hash) {
    return await market.methods.hashExists(hash).call();
}

async function getBuyerFiles(market, buyer) {
    return await market.methods.buyerInfo(buyer).call();
}

async function getAllFiles(market) {
    const fileCount = await getFileCount(market);
    return await Promise.all(
        Array(parseInt(fileCount))
            .fill(1)
            .map((el, i) => getFile(market, i))
    );
}

async function sell(market, erc20Address, price, metadataHash) {
    const receipt = await market.methods
        .sell(erc20Address, price.toString(), metadataHash)
        .send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return receipt.events["Sell"].returnValues.fileId;
}

//must call approve on erc20Address before calling buy
async function buy(market, fileId) {
    const receipt = await market.methods.buy(parseInt(fileId)).send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}

// to be used for expired subscriptions
async function isValidStream(market, streamId) {
    return await market.methods.isValid(streamId).call();
}

// call approve before in actiom
async function createSubscription(
    market,
    amount,
    paymentAsset,
    numofdays,
    seller
) {
    const receipt = await market.methods
        .createSubscription(
            amount.toString(),
            paymentAsset,
            numofdays,
            seller
        )
        .send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}

// seller clicks wothdraw for that particular subscription to get the funds locked, buyer address needed for filtering in mapping
async function withdrawSubscriptionAmount(market, streamId, amount) {
    console.log({streamId, amount: amount.toString()})
    const receipt = await market.methods
        .withdrawFromSubscription(streamId, amount.toString())
        .send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}

// buyer clicks on cancel for that particular seller
async function cancelSubscription(market, seller) {
    const receipt = await market.methods.cancelSubscription(seller).send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}

async function getStreamBalance(market, streamId, address) {
    return await market.methods.balanceOf(streamId, address).call();
}

async function getSubscriptionInfo(market, address) {
    return await market.methods.subscriptions(address).call();
}

// for enable subs
async function updateSubscriptionInfo(
    market,
    amountperday,
    minduration,
    tokenaddress
) {
    const receipt = await market.methods
        .updateSubscriptionInfo(amountperday.toString(), minduration, tokenaddress)
        .send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}

// for disable subs
async function disableSubscriptionInfo(market) {
    const receipt = await market.methods.disableSubscriptionInfo().send();
    if (!receipt.status) {
        logReceipt(receipt);
        throw "Transaction failed";
    }
    return {};
}
