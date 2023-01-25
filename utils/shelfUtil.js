const invalOutvalConditionSatify = async (inval, outval) => {
    return (Math.abs(inval - outval) < inval * 0.3)
}


module.exports = { invalOutvalConditionSatify }