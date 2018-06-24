import React, { Component } from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import {
  Table,
  Input,
  Form,
  Dropdown,
  Grid,
  Pagination,
  Button
} from "semantic-ui-react";
import MyChart from "./MyChart";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loading: true,
      initial_records: [],
      records: [],
      current_records: [],
      searching: false,
      total_count: 0,
      per_page: 10,
      total_pages: 0,
      current_page: 1,
      search_term: "",
      options_year: [],
      option_year_selected: "All",
      graph_data: []
    };

    // User function
    this.handlePaginationChange = this.handlePaginationChange.bind(this);
    this.handleGraphChange = this.handleGraphChange.bind(this);
    this.handleSearchTerm = this.handleSearchTerm.bind(this);
  }
  componentDidMount() {
    const api = "https://intellipharm.com.au/devtest/index.php";
    const prom = axios.get(api);

    prom
      .then(resp => {
        const data = resp.data;
        const total_count = data.length;
        const total_pages = Math.ceil(total_count / this.state.per_page);

        const options_year = this.getYearOptions(data);
        const allrecords = this.prepopulateRecords(data);
        const curr_records = this.getRecords(
          this.state.current_page,
          allrecords
        );

        this.setState((prevState, props) => ({
          initial_records: allrecords,
          records: allrecords,
          current_records: curr_records,
          is_loading: false,
          options_year: options_year,
          total_count: total_count,
          total_pages: total_pages
        }));
      })
      .catch(error => {
        console.log("NETWORK ERROR: No connection");
      });
  }
  handleGraphChange(e, { value }) {
    this.setState((prevState, props) => ({
      option_year_selected: value
    }));
  }
  handleSearchTerm(e) {
    const firstname = document.getElementById("firstname").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;

    if (!this.state.searching) {
      const api =
        "https://intellipharm.com.au/devtest/index.php?firstname=" +
        firstname +
        "&surname=" +
        surname +
        "&email=" +
        email;
      const prom = axios.get(api);
      prom.then(resp => {
        const data = resp.data;
        const pure_records = this.prepopulateRecords(data);
        const curr_records = this.getRecords(1, pure_records);
        const total_count = pure_records.length;
        const total_pages = Math.ceil(total_count / this.state.per_page);

        this.setState((prevState, props) => ({
          records: pure_records,
          current_records: curr_records,
          searching: false,
          total_count: total_count,
          total_pages: total_pages
        }));
      });
    }
  }
  handlePaginationChange(e, { activePage }) {
    const current_records = this.getRecords(activePage, this.state.records);
    this.setState(
      (prevState, props) => ({
        current_page: activePage,
        current_records: current_records
      }),
      () => {}
    );
  }
  getYearOptions(data) {
    let opts = new Map();

    for (let index = 0; index < data.length; index++) {
      const el = data[index];
      const year = el.joined_date.substr(0, 4);
      if (!opts.has(year)) opts.set(year, true);
    }
    const tmp = Array.from(opts.keys())
      .sort()
      .reverse()
      .map((v, k) => {
        return { key: v, text: v, value: v };
      });
    let cc = [];
    cc.push({ key: "All", text: "All", value: "All" });
    let ct = cc.concat(tmp);
    return ct;
  }

  prepopulateRecords(data) {
    let tmp = [];
    data.forEach(element => {
      const new_element = Object.assign(element, {
        fullname: element.firstname + " " + element.surname
      });
      tmp.push(new_element);
    });
    return tmp;
  }
  getRecords(cur_page, data) {
    let get_data = [];
    let curr_data = data;

    const page_pointer = (cur_page - 1) * this.state.per_page;
    const page_limit = (page_pointer ? cur_page : 1) * this.state.per_page;

    for (let i = page_pointer; i < page_limit; i++) {
      const element = curr_data[i];
      if (element) {
        get_data.push(element);
      }
    }

    return get_data;
  }

  render() {
    if (this.state.is_loading) return "LOADING";
    return (
      <div className="container">
        <div className="header">
          <div className="graph">
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>
              {this.state.option_year_selected}
            </div>
            <MyChart
              data={this.state.initial_records}
              year={this.state.option_year_selected}
            />
            <div>Pan Graph to reveal all</div>
          </div>
          <div className="control">
            <Form>
              <div className="control-graph">
                <Grid columns={1}>
                  <Grid.Row>
                    <Grid.Column>
                      <Dropdown
                        search
                        placeholder="Select a year for the graph"
                        fluid
                        selection
                        options={this.state.options_year}
                        onChange={this.handleGraphChange}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </div>
              <div className="control-search">
                <Grid columns={4}>
                  <Grid.Row>
                    <Grid.Column>
                      <Form.Field>
                        <Input
                          placeholder="Firstname"
                          className="fluid"
                          id={"firstname"}
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column>
                      <Form.Field>
                        <Input
                          placeholder="Surname"
                          className="fluid"
                          id={"surname"}
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column>
                      <Form.Field>
                        <Input
                          placeholder="Email Address"
                          className="fluid"
                          id={"email"}
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column>
                      <Form.Field>
                        <Button fluid onClick={this.handleSearchTerm}>
                          Search
                        </Button>
                      </Form.Field>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </div>
            </Form>
          </div>
        </div>
        <div className="body">
          <Table celled fixed singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Gender</Table.HeaderCell>
                <Table.HeaderCell>Joined Date</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.state.current_records.map((v, n) => {
                return (
                  <Table.Row key={n}>
                    <Table.Cell>{v.fullname}</Table.Cell>
                    <Table.Cell>{v.email}</Table.Cell>
                    <Table.Cell>{v.gender}</Table.Cell>
                    <Table.Cell>{v.joined_date}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
        <div className="footer">
          <Pagination
            activePage={this.state.current_page}
            onPageChange={this.handlePaginationChange}
            totalPages={this.state.total_pages}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(Layout);
