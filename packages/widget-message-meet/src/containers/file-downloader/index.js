import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import saveAs from 'browser-saveas';

import {bufferToBlob} from '../../utils/files';
import {retrieveSharedFile} from '../../actions/share';


function getDisplayName(C) {
  return C.displayName || C.name || `C`;
}

export default function injectFileDownloader(WrappedComponent) {
  class FileDownloader extends Component {
    constructor(props) {
      super(props);
      this.retrieveFile = this.retrieveFile.bind(this);
      this.getSharedFileFromStore = this.getSharedFileFromStore.bind(this);
      this.handleDownloadClick = this.handleDownloadClick.bind(this);
    }

    componentDidMount() {
      const {files} = this.props;
      files.forEach((file) => {
        this.getThumbnailImage(file);
      });
    }

    retrieveFile(file) {
      const props = this.props;
      props.retrieveSharedFile(file, props.spark);
    }

    getSharedFileFromStore(fileUrl) {
      const props = this.props;
      return props.share.get([`files`, fileUrl]);
    }

    getThumbnailImage(fileObject) {
      const image = fileObject.image;
      if (fileObject.mimeType === `image/gif` && fileObject.url) {
        this.retrieveFile(fileObject);
      }
      else if (image && (image.url && !this.getSharedFileFromStore(image.url) || image.scr)) {
        this.retrieveFile(image);
      }
    }

    handleDownloadClick(fileObject) {
      const props = this.props;
      const cachedFile = this.getSharedFileFromStore(fileObject.url);
      if (cachedFile && cachedFile.blob) {
        saveAs(cachedFile.blob, fileObject.displayName);
      }
      else {
        props.retrieveSharedFile(fileObject, props.spark)
          .then((file) => {
            const {blob} = bufferToBlob(file);
            saveAs(blob, file.name);
          });
      }
    }

    render() {
      return <WrappedComponent onDownloadClick={this.handleDownloadClick} {...this.props} />;
    }
  }

  FileDownloader.propTypes = {
    files: PropTypes.array
  };

  FileDownloader.displayName = `FileDownloader(${getDisplayName(WrappedComponent)})`;
  FileDownloader.WrappedComponent = WrappedComponent;

  return connect(
    (state) => ({
      share: state.share,
      spark: state.spark.get(`spark`)
    }),
    (dispatch) => bindActionCreators({
      retrieveSharedFile
    }, dispatch)
  )(FileDownloader);
}
