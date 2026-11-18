// Stub cho nền web: react-native-youtube-iframe (bản web) import gói này nhưng gói chưa được cài.
// Chỉ ảnh hưởng màn hình phát video YouTube trên web; mobile không dùng file này.
const React = require("react");
const { View } = require("react-native");

const WebView = React.forwardRef(function WebView(props, ref) {
  return React.createElement(View, { ref, style: props.style });
});

module.exports = WebView;
module.exports.default = WebView;
module.exports.WebView = WebView;
