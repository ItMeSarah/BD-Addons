/**
 * @name UnixTimestamps
 * @description Like regular timestamps, but unix.
 * @version 1.0.0
 * @author Zerebos
 */

const pt = BdApi.Webpack.getModule(m => m?.toString?.()?.includes("formatted:"), {searchExports: true});
const mt = BdApi.Webpack.getModule(m => m?.toString?.()?.includes("MESSAGE_EDITED_TIMESTAMP_A11Y_LABEL"), {defaultExport: false});

const getClass = (original, args) => {
    class unixTimestamp extends BdApi.React.Component {
        componentDidMount() {
            this.interval = setInterval(this.forceUpdate.bind(this), 1000);
        }
        componentWillUnmount() {
            if (this.interval) clearInterval(this.interval);
        }
        render() {
            const ret = Reflect.apply(original, null, [this.props]);
            const ts = pt(args[0].timestamp.unix(), "R");
            ret.props.children.props.children[1] = ts.formatted;
            return ret;
        }
    }
    return function() {return BdApi.React.createElement(unixTimestamp, arguments[0])};
};

module.exports = class unixTimestamps { 
    start() {
        
        BdApi.Patcher.after("unixTimestamps", mt, "Z", (t,a,r) => {
            const orig = r.props.children.props.children;
            if (orig.__patched) return;
            r.props.children.props.children = getClass(orig, a);
            r.props.children.props.children.__patched = true;
        });
    }

    stop() {
        BdApi.Patcher.unpatchAll("unixTimestamps");
    }
}