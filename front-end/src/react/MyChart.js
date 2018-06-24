import {
  VictoryChart,
  VictoryBar,
  VictoryLabel,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryTheme
} from "victory";
import React, { Component } from "react";

class MyChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loading: true,
      data: props.data,
      chart_data: [],
      year: props.year,
      categories: [],
      zoom_domain_count: 10,
      zoom_domain_x: [],
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      highest: 0
    };
    this.makeChart = this.makeChart.bind(this);
  }
  componentDidMount() {
    // Preprocess the data thats been given
    this.makeChart();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.year != this.state.year) {
      this.setState(
        () => ({
          year: nextProps.year,
          is_loading: true
        }),
        () => {
          this.makeChart();
        }
      );
    }
  }
  makeChart() {
    let tmp_data = [];
    let tmp_zoom_x = [];
    let tmp_keys = [];
    let tmp = new Map();
    let highest = 0;

    if (this.state.year.trim() == "" || this.state.year == "All") {
      // Grabs all year
      this.state.data.map((element, ind) => {
        const joined_date = element.joined_date;
        const year = joined_date.substring(0, 4);

        if (tmp.has(year)) {
          tmp.set(year, tmp.get(year) + 1);
        } else {
          tmp.set(year, 1);
        }
      });
      tmp_keys = Array.from(tmp.keys()).sort();
      tmp_keys.map(key => {
        const val = tmp.get(key);
        tmp_data.push({ time: new Date(key, 0, 1), count: val, label: val });
        if (val > highest) highest = val;
      });

      const min = tmp_keys[0];
      const miv = new Date(min, 0, 1);
      if (this.state.zoom_domain_count < tmp_keys.length) {
        const mxv = new Date(tmp_keys[this.state.zoom_domain_count], 11, 31);
        tmp_zoom_x = [miv, mxv];
      } else {
        const mzv = new Date(tmp_keys[tmp_keys.length - 1], 11, 31);
        tmp_zoom_x = [miv, mzv];
      }
    } else {
      // Grabs months of that year

      this.state.data.map(element => {
        const joined_date = element.joined_date;
        const year = joined_date.substring(0, 4);
        const month = joined_date.substring(5, 7);

        if (year == this.state.year) {
          if (tmp.has(month)) {
            tmp.set(month, tmp.get(month) + 1);
          } else {
            tmp.set(month, 1);
          }
        }
      });

      const year = this.state.year;
      tmp_keys = Array.from(tmp.keys()).sort();

      this.state.months.map((mon, key) => {
        let month_int = (key + 1).toString();
        if (month_int < 10) month_int = "0" + month_int;

        if (tmp.has(month_int)) {
          const val = tmp.get(month_int);
          tmp_data.push({
            time: new Date(year, key, 1),
            count: val,
            label: mon
          });
          if (val > highest) highest = val;
        } else {
          tmp_data.push({
            time: new Date(year, key, 1),
            count: 0,
            label: mon
          });
        }
      });

      const min = parseInt(tmp_keys[0]) - 1;
      const miv = new Date(year, min, 1);

      if (this.state.zoom_domain_count < tmp_keys.length) {
        const mxv = new Date(year, tmp_keys[this.state.zoom_domain_count], 31);

        tmp_zoom_x = [miv, mxv];
      } else {
        const mzv = new Date(year, tmp_keys[tmp_keys.length - 1], 31);
        tmp_zoom_x = [miv, mzv];
      }
    }
    // console.log("DATA: ", tmp_data);
    // console.log("ZOOM_X: ", tmp_zoom_x);

    const categories = Array.from(tmp.keys());

    this.setState((prevState, props) => ({
      is_loading: false,
      chart_data: tmp_data,
      categories: categories,
      zoom_domain_x: tmp_zoom_x,
      highest: highest
    }));
  }
  render() {
    if (this.state.is_loading) return "";
    else
      return (
        <div
          style={{
            maxWidth: "800px",
            height: "250px",
            margin: "0 auto"
          }}
        >
          <VictoryChart
            height={250} // height of the chart
            width={600} // width of the chart
            domainPadding={{ x: [10, 50] }} // padding x [left, right] and y [top, bottom]
            scale={{ x: "time" }} // tells the chart what data to use, time (time is use for the data as new Date) | linear
            containerComponent={
              // must use for zooming when data is too big
              <VictoryZoomContainer
                zoomDomain={{ x: this.state.zoom_domain_x }} // x/y[min,max] to zoom into
                zoomDimension="x" // which coordinates will allow for zooming
              />
            }
            domain={{ y: [0, this.state.highest + 10] }} // tells x and y coordinates fixed data range
          >
            <VictoryBar
              x="time" // name of data for x
              y="count" // name of data for y
              data={this.state.chart_data} // the data to feed to the chart
              barRatio={1} // how big the bar is
              alignment={"start"} // where to align the bar
              style={{ data: { fill: "green" } }} // color of the bar
              labelComponent={
                // use label component if you add "label" to data
                <VictoryLabel
                  angle={0}
                  textAnchor="start"
                  dx={10} // position from origin
                  dy={7} // position from origin
                  text={d => {
                    //console.log("Datum: ", d.datum.count);
                    return d.count; // display text to the bar
                  }}
                  style={{
                    fontSize: 10, // size of the label
                    fill: "#aaa" // color of the label
                  }}
                />
              }
            />
            <VictoryAxis // X
              standalone={false}
              label={this.state.year == "All" ? "Year" : "Month"}
              tickFormat={d => {
                // how you like to change the tick label
                if (this.state.year == "All") {
                  return d.getFullYear();
                } else {
                  return this.state.months[d.getMonth()];
                }
              }}
              style={{
                tickLabels: { angle: 0, fontSize: 12 } // the tick label style
              }}
              tickLabelComponent={<VictoryLabel textAnchor="start" />} // the tick label additional option
            />
            <VictoryAxis // Y
              dependentAxis // make the Y axis visible
              label={"Joined count"}
              standalone={false}
              tickFormat={d => {
                return d;
              }}
              style={{
                axisLabel: { padding: 40 } // the style to the label itself
              }}
            />
          </VictoryChart>
        </div>
      );
  }
}
export default MyChart;
