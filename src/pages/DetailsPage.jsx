import React, { useState, useEffect } from "react";
import { useQuery } from "urql";
import { connect } from "react-redux";
import { userActions } from "../actions";
import ProfileHover from "profile-hover";
import { history, getTokenSymbol } from "../helpers";
import "../assets/scss/detailsPage.scss";
import Comments from "../components/Comments";
import Loading from "../components/Loading";
import { fileAndUserQuery } from "../helpers/graph";
import { ipfsService } from "../services";

const DetailsPage = ({
    match: {
        params: { fileId }
    },
    connected,
    getFile,
    account,
    buy,
    downloadFile,
    box
}) => {
    const [location, setLocation] = useState("");
    const [file, setFile] = useState();
    const [days, setDays] = useState("");
    const [isBuyer, setIsBuyer] = useState(false);
    const [isSubscriber, setIsSubscriber] = useState(false);
    const query = fileAndUserQuery(fileId, account);
    // check if the user has already bought the file
    const [res, executeQuery] = useQuery({
        query: query,
        requestPollicy: "network-only"
    });
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        async function getMetadata() {
            let file = res.data.file;
            const metadata = await ipfsService.getMetadata(file.metadataHash);
            file.metadata = metadata;
            setFile(file);
            if (account) {
                let isBuyer = file.buyers.some(
                    owner => owner.address === account.toLowerCase()
                );
                setIsBuyer(isBuyer);
            }
            if (
                res.data.user &&
                res.data.subscriptions &&
                res.data.subscriptions.length
            ) {
                let isSubscriber = file.suscriptions.some(
                    subscription =>
                        subscription.seller.address === file.seller.address
                );
            }
        }
        if (res && !res.error && !res.fetching && res.data.file) {
            console.log("getting metadata");
            getMetadata();
        }
    }, [res]);

    useEffect(() => {
        if (file && connected) {
            const location = localStorage.getItem(parseInt(fileId));
            console.log({ location });
            setLocation(location);
            setIsSeller(account && account.toLowerCase() === file.seller.address)
        }
    }, [file, connected]);

    if (res.fetching) return <Loading />;
    if (res.error) return <p>Errored!</p>;

    return (
        <section className="filePage">
            {file && file.metadata && (
                <div className="fileItem" key={file.metadataHash}>
                    <div className="detailsLeftBar">
                        <img
                            className="fileImage"
                            src={`https://ipfs.infura.io/ipfs/${file.metadata.imageHash}`}
                        />
                        {!isBuyer && !isSeller && (
                            <a
                                className="buyButton button"
                                onClick={e => {
                                    buy(parseInt(fileId));
                                }}
                            >
                                Buy File
                            </a>
                        )}
                        {(isBuyer || isSubscriber) && !isSeller && (
                            <a
                                className="downloadButton button"
                                onClick={async e => {
                                    const location = await downloadFile(
                                        parseInt(fileId)
                                    );
                                    localStorage.setItem(
                                        parseInt(fileId),
                                        location
                                    );
                                    setLocation(location);
                                }}
                            >
                                Download File
                            </a>
                        )}
                        {isSeller && (
                            <div className="sellerButton">
                                You sold this file
                            </div>
                        )}
                    </div>
                    <div className="detailsRightBar">
                        <span className="label labelTitle">title</span>
                        <span className="fileTitle">{file.metadata.title}</span>
                        <span className="label">sold by</span>
                        <div
                            className="fileSellerContainer"
                            onClick={() => {
                                history.push(`/users/${file.seller.address}`);
                            }}
                        >
                            <ProfileHover
                                className="fileSeller"
                                address={file.seller.address}
                                orientation="bottom"
                                tileStyle
                            />
                        </div>
                        <span className="label">price</span>
                        <span className="filePrice">{`${(
                            file.price /
                            10 ** 18
                        ).toFixed(2)} ${getTokenSymbol(
                            file.priceAsset
                        )}`}</span>
                        <span className="label">Number of buys</span>
                        <span className="fileBuys">{`${file.numBuys}`}</span>
                        <span className="label">upload date</span>
                        <span className="uploadDate">
                            {new Date(file.metadata.uploadDate).toString()}
                        </span>

                        <span className="label">description</span>
                        <span className="fileDescription">
                            {file.metadata.description}
                        </span>
                        {location && location != "undefined" && (
                            <>
                                <span className="label">
                                    local file location
                                </span>
                                <span className="fileDescription">
                                    {location}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}
            {connected && box && file && (
                <div className="fileComments">
                    <Comments
                        fileId={parseInt(fileId)}
                        metadataHash={file.metadataHash}
                    />
                </div>
            )}
        </section>
    );
};

function mapState(state) {
    const { connected, account } = state.web3;
    const { box } = state.box;
    return { connected, box, account };
}

const actionCreators = {
    getFile: userActions.getFile,
    buy: userActions.buy,
    downloadFile: userActions.downloadFile
};

const connectedDetailsDisplay = connect(mapState, actionCreators)(DetailsPage);

export default connectedDetailsDisplay;
