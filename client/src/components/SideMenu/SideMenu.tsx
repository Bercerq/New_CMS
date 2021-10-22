import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { itemIdAction } from '@redux/actions/menuStatus';

import { MenuItem, style } from '@utils/constants/MenuItem/MenuItem';
import { useTypedSelector } from '@utils/hooks/useTypedSelector';

import {
    NavbarContainer,
    NavbarItem,
    TitleNavbarSubItem,
    Title
} from './styled/styled';

export const SideMenu: FC = () => {
    const statusmenu = useTypedSelector( ({ menuReducer }) => menuReducer.status);
    const pickedId = useTypedSelector( ({ menuReducer }) => menuReducer.itemId);

    const dispatch = useDispatch();

    const handleSetItemID = (itemId: number) => () => {
        if (pickedId === itemId) {
            dispatch(itemIdAction(0));
        } else {
            dispatch(itemIdAction(itemId));
        }
    };

    return (
        <NavbarContainer statusmenu={statusmenu}>
            {MenuItem.map(({ name, path, itemId, icon, subitems, height }) =>
                path ? (
                    <NavbarItem
                        exact
                        to={path}
                        activeStyle={style}
                        padding="15px"
                        key={itemId}
                        onClick={handleSetItemID(itemId)}
                        statusmenu={statusmenu}
                    >
                        {icon}
                        <span>{name}</span>
                    </NavbarItem>
                ) : (
                    <TitleNavbarSubItem
                        isItemSelected={pickedId === itemId}
                        height={height}
                    >
                        <Title onClick={handleSetItemID(itemId)}>
                            {icon}
                            <span>{name}</span>
                        </Title>
                        {subitems?.map(({ subName, subPath }) => (
                            <NavbarItem
                                exact
                                to={subPath}
                                activeStyle={style}
                                padding="55px"
                                key={subPath}
                            >
                                {subName}
                            </NavbarItem>
                        ))}
                    </TitleNavbarSubItem>
                )
            )}
        </NavbarContainer>
    );
};
