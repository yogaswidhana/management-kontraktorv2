import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface DashboardProps {
    role: string;
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {role === 'contractor' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Info Proyek</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi dan pengisian data umum proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/informasi-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Progres</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/detail-progress-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Lapor Dimensi</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan dimensi proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/lapor-dimensi">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Lapor Pemadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan pemadatan proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/lapor-pemadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Lapor Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Isi laporan metode kerja proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/lapor-metode-kerja">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Perkiraan Derajat Kepadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-perkiraan-kepadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Penilaian Kesesuaian Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-penilaian-kesesuaian">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </>
                )}
                {role === 'consultant' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Info Proyek</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/informasi-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Progres</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/detail-progress-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Periksa Pelaporan Dimensi</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan dimensi proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/periksa-dimensi">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Periksa Pelaporan Pemadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan pemadatan proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/periksa-pemadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Periksa Pelaporan Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Periksa laporan metode kerja proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/periksa-metode-kerja">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Perkiraan Derajat Kepadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-perkiraan-kepadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Penilaian Kesesuaian Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-penilaian-kesesuaian">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </>
                )}
                {role === 'owner' && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Info Proyek</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Akses informasi proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/informasi-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Progres</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat detail progres pekerjaan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/detail-progress-proyek">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Persetujuan Pelaporan Dimensi</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan dimensi proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/persetujuan-dimensi">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Persetujuan Pelaporan Pemadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan pemadatan proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/persetujuan-pemadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Persetujuan Pelaporan Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Setujui laporan metode kerja proyek.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/persetujuan-metode">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Perkiraan Derajat Kepadatan</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil perkiraan derajat kepadatan.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-perkiraan-kepadatan">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">Hasil Penilaian Kesesuaian Metode Kerja</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Lihat hasil penilaian kesesuaian metode kerja.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" component={Link} to="/hasil-penilaian-kesesuaian">Akses</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </>
                )}
            </Grid>
        </Container>
    );
};

export default Dashboard;