import * as React from 'react';
import {PropsWithChildren} from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import Grid from "@mui/material/Unstable_Grid2";
import {Accordion, AccordionDetails, AccordionSummary, Stack, TextField} from "@mui/material";
import {BackhgroundColor} from "@/app/theme";
import NumberInputBasic from "@/app/components/numberInput";
import {ExpandMore} from "@mui/icons-material";

const drawerWidth = 400;

const Main = styled('div', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
}>(({theme, open}) => ({
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    }),
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: 'relative',
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    }),
}));

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'left',
    padding: theme.spacing(0, 0),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
    backgroundColor: BackhgroundColor
}));

const Content = styled(Grid)(({theme}) => ({
    padding: 0,
    textAlign: 'left',
    width: `calc(100% - ${drawerWidth}px)`,
    justifyContent: 'flex-start',

}));

const DrawerNumberInput = styled(NumberInputBasic)(({theme}) => ({
    width: '40px', height: '40px'
}));

const DrawerInputLabel = styled(Typography)(({theme}) => ({
    width: 300,
    variant: 'body1'
}));
const DrawerInputTextInput = styled(TextField)(({theme}) => ({
    width: '40px', height: '40px'
}));

const DrawerItem = styled(Stack)(({theme}) => ({
    alignItems: 'center',
    width: '100%'
}));


export default function PersistentDrawerRight(props: PropsWithChildren<{ open: boolean }>) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(props.open);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar position="fixed" open={open} sx={{backgroundColor: BackhgroundColor}}>
                <Toolbar sx={{backgroundColor: BackhgroundColor}}>
                    <Typography variant="h6" noWrap sx={{flexGrow: 1}} component="div">
                        Persistent drawer
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerOpen}
                        sx={{...(open && {display: 'none'})}}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid direction={'row'} sx={{width: '100%'}}>
                <Main open={open}>

                    <DrawerHeader/>
                    <Content>
                        {props.children}
                    </Content>
                </Main>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                        },
                    }}
                    variant="persistent"
                    anchor="right"
                    open={open}
                >

                    <DrawerHeader sx={{backgroundColor: BackhgroundColor}}>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                        </IconButton>
                    </DrawerHeader>
                    <Divider/>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Settings
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Custom skillmax bonus</DrawerInputLabel>
                                        <DrawerNumberInput onChange={() => {
                                        }}/>
                                    </DrawerItem>
                                </ListItem>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Custom spellmax bonus</DrawerInputLabel>
                                        <DrawerNumberInput onChange={() => {
                                        }}/>
                                    </DrawerItem>
                                </ListItem>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Copy-paste separator</DrawerInputLabel>
                                        <DrawerNumberInput onChange={() => {
                                        }}/>
                                    </DrawerItem>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    <Divider/>

                </Drawer>
            </Grid>

        </Box>
    );
}