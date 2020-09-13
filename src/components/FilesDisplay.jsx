import React, { useState } from "react";
import { connect } from "react-redux";
import { userActions } from "../actions";
import { history, getTokenSymbol } from "../helpers";
import { Link } from "react-router-dom";
import ProfileHover from "profile-hover";
import pricetag from "../assets/img/pricetag.svg";
import "../assets/scss/filesDisplay.scss";

const FilesDisplay = ({ allFiles }) => {
    return (
        <div className="filesDisplay">
            {allFiles &&
                allFiles.reverse().map((file, fileId) => (
                    <div className="fileItem" key={file.metadataHash}>
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
                            />
                        </div>
                        <Link
                            className="fileItemInner"
                            to={`/files/${file.id}`}
                        >
                            <img
                                className="fileImage"
                                src={`https://ipfs.infura.io/ipfs/${file.metadata.imageHash}`}
                            />
                            <span className="fileTitle">
                                {file.metadata.title}
                            </span>
                            <div className="fileMeta">
                                <span className="fileRetrivals">
                                    {`${file.numBuys} buys`}
                                </span>
                                <span className="filePrice">{`${(
                                    file.price /
                                    10 ** 18
                                ).toFixed(2)} ${getTokenSymbol(
                                    file.priceAsset
                                )}`}</span>
                                <img className="pricetag" src={pricetag} />
                            </div>
                        </Link>
                    </div>
                ))}
        </div>
    );
};

function mapState(state) {
    return {};
}

export default FilesDisplay;
