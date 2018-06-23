import {
  VictoryChart,
  VictoryBar,
  VictoryLabel,
  VictoryZoomContainer
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
      console.log("DEFAULT");

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
        tmp_data.push({ time: new Date(key, 0, 1), count: val });
        if (val > highest) highest = val;
      });

      const min = tmp_keys[0];
      if (this.state.zoom_domain_count < tmp_keys.length) {
        const miv = new Date(min, 0, 1);
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
      console.log("YEAR", tmp);
      const months = [
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
      ];
      const year = this.state.year;
      tmp_keys = Array.from(tmp.keys()).sort();
      console.log("KEYS", tmp);

      months.map((mon, key) => {
        let month_int = (key + 1).toString();
        if (month_int < 10) month_int = "0" + month_int;
        console.log("month-n", month_int);

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

    const categories = Array.from(tmp.keys());
    console.log("Chart Data: ", tmp_data);
    console.log("Zoom Data: ", tmp_zoom_x);

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
            height={250}
            width={600}
            domainPadding={{ x: 20 }}
            scale={{ x: "time" }}
            containerComponent={
              <VictoryZoomContainer
                zoomDomain={{ x: this.state.zoom_domain_x }}
                zoomDimension="x"
              />
            }
            domain={
              this.state.year != "All" ? { y: [0, this.state.highest + 5] } : {}
            }
          >
            <VictoryBar
              x="time"
              y="count"
              data={this.state.chart_data}
              barRatio={1}
              alignment={"middle"}
              style={{ data: { fill: "tomato" } }}
              labelComponent={<VictoryLabel angle={0} textAnchor="middle" />}
            />
          </VictoryChart>
        </div>
      );
  }
}
export default MyChart;
