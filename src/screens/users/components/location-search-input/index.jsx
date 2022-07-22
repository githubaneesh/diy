import React, { Component } from 'react';
import { FaTimes } from 'react-icons/fa';

class LocationSearchInput extends Component {
    constructor(props) {
        super(props);
        this.autocompleteInput = React.createRef();
        this.state = {
            googleMapsReady: false,
            location: ''
        };
    }

    componentDidMount() {
        const google = window.google;
        if(google) {
            this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'),
            {"types": ["geocode"]});
        
        this.autocomplete.addListener('place_changed', this.handlePlaceChanged);
        this.setState({ googleMapsReady: true });
        }
    }

    handlePlaceChanged= async()=> {
        const place = this.autocomplete.getPlace();
     
        let formattedAddress = "";
        let city = "";
        let state = "";
        let country = "";
        place.address_components.forEach((p) => {

            if (p.types.indexOf("country") !== -1) {
                country = p.long_name
            }
            else if (p.types.indexOf("locality") !== -1 || (city === "" && (p.types.indexOf("sublocality") !== -1 || p.types.indexOf("administrative_area_level_2") !== -1))) {
                city = p.long_name;
            }
            else if (p.types.indexOf("administrative_area_level_1") !== -1) {
                state = p.long_name;
            }
            else if (!state && p.types.indexOf("administrative_area_level_2") !== -1) {
                state = p.long_name;
            }

        })

        formattedAddress = `${city}, ${state}, ${country}`;
        this.setState({ location: formattedAddress }, () => {
            this.props.onPlaceChanged(this.state.location);
        })
    }

    clearText = ()=>{
        this.setState({location: ''});
        this.autocompleteInput.current.value = "";
        this.props.clearLocation();
    }

    render() {
        return (
            <div className="location-autocomplete">
                <input type="text"
                    ref={this.autocompleteInput}
                    id="autocomplete" placeholder="Enter a location">
                </input>
                {
                    this.state.location &&
                    <button className="button" onClick={this.clearText}><FaTimes/></button>
                }
            </div>
        );
    }
}

export default LocationSearchInput;