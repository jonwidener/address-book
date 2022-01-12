import React, { useState } from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { addresses: [], displayAddresses: [], filter: '' };
    this.updateFilter = this.updateFilter.bind(this);
    this.onAddButton = this.onAddButton.bind(this);
  }

  componentDidMount() {
    const xhr = new XMLHttpRequest();
    const self = this;
    const addresses = [];
    xhr.open('POST', '/cgi/crud.php', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        for (const address of response) {
          address.address_name = address.name;
          delete address.name;
          address.edit_mode = false;
          addresses.push(address);
        }
        self.setState({ addresses: addresses });    
        self.applyFilter();
      }
    }
    xhr.send(JSON.stringify({ 
      schema: 'address_book', 
      mode: 'read', 
      table: 'addresses', 
      data: { 
        'id': '', 
        'name': '', 
        'address_line_1': '',
        'address_line_2': '',
        'city': '',
        'state': '',
        'zip_code': ''
        } 
      }));
  }

  updateFilter(value) {
    this.setState({ filter: value });
    this.applyFilter();
  }

  applyFilter() {
    const displayAddresses = [];    
    for (const address of this.state.addresses) {
      for (const attr in address) {
        if (['id', 'edit_mode'].includes(attr)) {
          continue;
        }
        if (address[attr].toUpperCase().includes(this.state.filter.toUpperCase())) {
          displayAddresses.push(address);
          break;
        }
      }
    }
    this.setState({ displayAddresses: displayAddresses });
  }

  onAddButton() {    
    const temp = {
      id: '', 
      address_name: '', 
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: ''
    };
    temp.edit_mode = true;
    this.setState({ displayAddresses: this.state.displayAddresses.concat(temp) });
  }

  renderAddresses() {
    const htmlOut = this.state.displayAddresses.map((address) => {
      return (
        <AddressCard key={address.id}
          id={address.id}
          name={address.address_name}
          address_line_1={address.address_line_1}
          address_line_2={address.address_line_2}
          city={address.city} 
          state={address.state}
          zip_code={address.zip_code}
          edit_mode={address.edit_mode}
        />
      );      
    });

    return htmlOut;
  }
  
  render() {
    return (
      <div className="App">
        <h1>Address Book</h1>
        <div>
          <span style={{ display: 'inline-block' }}>
            <SearchForm 
              onChange={this.updateFilter}
            />
          </span>
          <span style={{ display: 'inline-block', width: '1em' }}></span>
          <button onClick={this.onAddButton}>Add</button>   
        </div>
        {this.renderAddresses()}
      </div>
    );
  }
}

const SearchForm = (props) => {
  const [filter, setFilter] = useState('');  

  const handleChange = (event) => {
    setFilter(event.target.value);
    props.onChange(event.target.value);
  };
  
  return (
    <form>
      <label>
        <span>Search: </span>
        <input type="text" value={filter} onChange={handleChange} />
      </label>        
    </form>
  );  
}

class AddressCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      address_name: props.name,
      address_line_1: props.address_line_1,
      address_line_2: props.address_line_2,
      city: props.city, 
      state: props.state,
      zip_code: props.zip_code,
      edit_mode: false,
      undoAddress: undefined  
    }

    this.handleChange = this.handleChange.bind(this);
    this.onEditButton = this.onEditButton.bind(this);
    this.onSaveButton = this.onSaveButton.bind(this);
    this.onCancelButton = this.onCancelButton.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });

  }

  onEditButton() {
    this.setState({ 
      edit_mode: true, 
      undoAddress: {
        id: this.state.id,
        address_name: this.state.address_name,
        address_line_1: this.state.address_line_1,
        address_line_2: this.state.address_line_2,
        city: this.state.city, 
        state: this.state.state,
        zip_code: this.state.zip_code,
      }
    });
  }

  onSaveButton() {
    if (this.state.id === '') {
      // create
      const xhr = new XMLHttpRequest()
      const self = this
      xhr.open('POST', '/cgi/crud.php', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // const response = JSON.parse(xhr.responseText);
          // probably should do something with the response
          self.setState({ edit_mode: false });
        }
      }
      xhr.send(JSON.stringify({ 
        schema: 'address_book', 
        mode: 'create', 
        table: 'addresses', 
        data: { 
          'name': this.state.address_name, 
          'address_line_1': this.state.address_line_1,
          'address_line_2': this.state.address_line_2,
          'city': this.state.city,
          'state': this.state.state,
          'zip_code': this.state.zip_code,
        } 
      }));
    } else {
      // update
      const xhr = new XMLHttpRequest()
      const self = this
      xhr.open('POST', '/cgi/crud.php', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // const response = JSON.parse(xhr.responseText);
          // probably should do something with the response
          self.setState({ edit_mode: false });
        }
      }
      xhr.send(JSON.stringify({ 
        schema: 'address_book', 
        mode: 'update', 
        table: 'addresses', 
        data: { 
          'name': this.state.address_name, 
          'address_line_1': this.state.address_line_1,
          'address_line_2': this.state.address_line_2,
          'city': this.state.city,
          'state': this.state.state,
          'zip_code': this.state.zip_code,
          'where': {'and': [['id', ['=', this.state.id]]]}
        } 
      }));
    }

  }
  
  onCancelButton() {
    this.setState({ 
      id: this.state.undoAddress.id,
      address_name: this.state.undoAddress.address_name,
      address_line_1: this.state.undoAddress.address_line_1,
      address_line_2: this.state.undoAddress.address_line_2,
      city: this.state.undoAddress.city, 
      state: this.state.undoAddress.state,
      zip_code: this.state.undoAddress.zip_code,
      edit_mode: false
    });
  }

  render() {
    return this.state.edit_mode ? (
      <div className="address-card">
        <form>
          <div>
            <span className="address-label">Name:</span>
            <input name="address_name" value={this.state.address_name} onChange={this.handleChange} /><br/>
            <span className="address-label">Address Line 1:</span>
            <input name="address_line_1" value={this.state.address_line_1} onChange={this.handleChange} /><br/>
            <span className="address-label">Address Line 2:</span>
            <input name="address_line_2" value={this.state.address_line_2} onChange={this.handleChange} /><br/>
            <span className="address-label">City:</span>
            <input name="city" value={this.state.city} onChange={this.handleChange} /><br/>
            <span className="address-label">State:</span>
            <select name="state" value={this.state.state} onChange={this.handleChange}>
              {jsxStates}
            </select><br/>
            <span className="address-label">Zip Code:</span>
            <input name="zip_code" value={this.state.zip_code} onChange={this.handleChange} /><br/>
          </div>
        </form>
        <div style={{ marginTop: '0.5em' }}>
          <button onClick={this.onSaveButton}>Save</button>
          <span style={{ display: 'inline-block', width: '1em' }}></span>
          <button onClick={this.onCancelButton}>Cancel</button>
        </div>
      </div>
    ) : (
      <div className="address-card">
        {this.state.address_name}<br/>
        {this.state.address_line_1}<br/>
        {this.state.address_line_2}<br/>
        {this.state.city}, {this.state.state} {this.state.zip_code}
        <div style={{ marginTop: '0.5em' }}>
          <button onClick={this.onEditButton}>Edit</button>
        </div>
      </div>
    );
  }
}

const theStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO',
  'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const jsxStates = theStates.map((state) => <option key={state}>{state}</option>);

export default App;
