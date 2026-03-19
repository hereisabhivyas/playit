import { useState } from 'react';
import type { FormEvent } from 'react';
import type { LoginPayload, SignupPayload, UserProfile } from '../types';
import { loginUser, signupUser } from '../services/api';
import '../styles/auth-page.css';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: UserProfile) => void;
}

const COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

const PRESET_GENRES = [
  'Pop',
  'Rock',
  'Hip Hop',
  'Rap',
  'R&B',
  'Soul',
  'Jazz',
  'Blues',
  'Country',
  'Classical',
  'Electronic',
  'EDM',
  'House',
  'Techno',
  'Trance',
  'Dubstep',
  'Lo-fi',
  'Indie',
  'Alternative',
  'Metal',
  'Punk',
  'Folk',
  'Reggae',
  'Dancehall',
  'Afrobeat',
  'Latin',
  'K-Pop',
  'J-Pop',
  'Gospel',
  'Funk',
  'Disco',
  'Ambient',
  'Drill',
  'Grime',
  'Trap',
  'Soundtrack',
  'Instrumental',
];

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(PRESET_GENRES[0]);
  const [customGenre, setCustomGenre] = useState('');
  const [interestedGenres, setInterestedGenres] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetOptionalFields = () => {
    setName('');
    setEmail('');
    setRegion('');
    setSelectedGenre(PRESET_GENRES[0]);
    setCustomGenre('');
    setInterestedGenres([]);
    setBio('');
  };

  const addGenre = (genreValue: string) => {
    const trimmedGenre = genreValue.trim();
    if (!trimmedGenre) return;

    const alreadySelected = interestedGenres.some(
      (genre) => genre.toLowerCase() === trimmedGenre.toLowerCase(),
    );

    if (!alreadySelected) {
      setInterestedGenres((previous) => [...previous, trimmedGenre]);
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setInterestedGenres((previous) => previous.filter((genre) => genre !== genreToRemove));
  };

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setError('');
    setPassword('');
    if (nextMode === 'login') {
      resetOptionalFields();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const payload: LoginPayload = { username, password };
        const result = await loginUser(payload);
        onAuthSuccess(result.token, result.user);
      } else {
        const payload: SignupPayload = {
          username,
          password,
          name,
          email,
          region,
          bio,
          interestedGenres,
        };
        const result = await signupUser(payload);
        onAuthSuccess(result.token, result.user);
      }
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError('Unable to continue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Playit Account</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Log in to continue listening.'
            : 'Create your profile and start personalizing your music.'}
        </p>

        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`mode-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`mode-button ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              required
              minLength={3}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="musiclover"
            />
          </label>

          <label>
            Password
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          {mode === 'signup' && (
            <>
              <label>
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </label>

              <label>
                Region
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="genres-label">
                Interested Genres
                <div className="genre-select-row">
                  <select
                    value={selectedGenre}
                    onChange={(event) => setSelectedGenre(event.target.value)}
                  >
                    {PRESET_GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="genre-plus-button"
                    title="Add selected genre"
                    onClick={() => addGenre(selectedGenre)}
                  >
                    +
                  </button>
                </div>

                <div className="genre-select-row">
                  <input
                    value={customGenre}
                    onChange={(event) => setCustomGenre(event.target.value)}
                    placeholder="Add custom genre"
                  />
                  <button
                    type="button"
                    className="genre-plus-button"
                    title="Add custom genre"
                    onClick={() => {
                      addGenre(customGenre);
                      setCustomGenre('');
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="genre-chip-list">
                  {interestedGenres.length === 0 ? (
                    <span className="genre-empty-text">No genres selected yet.</span>
                  ) : (
                    interestedGenres.map((genre) => (
                      <span key={genre} className="genre-chip">
                        {genre}
                        <button
                          type="button"
                          className="genre-chip-remove"
                          aria-label={`Remove ${genre}`}
                          onClick={() => removeGenre(genre)}
                        >
                          x
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </label>

              <label>
                Bio
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell us what you love to listen to"
                  rows={3}
                />
              </label>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
